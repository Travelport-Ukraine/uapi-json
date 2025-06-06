const screenLib = require('galileo-screen');
const { TerminalRuntimeError } = require('./TerminalErrors');
const terminalService = require('./TerminalService');
const validateServiceSettings = require('../../utils/validate-service-settings');
const { getHashSubstr } = require('../../utils');

const TERMINAL_STATE_NONE = 'TERMINAL_STATE_NONE';
const TERMINAL_STATE_BUSY = 'TERMINAL_STATE_BUSY';
const TERMINAL_STATE_READY = 'TERMINAL_STATE_READY';
const TERMINAL_STATE_CLOSED = 'TERMINAL_STATE_CLOSED';
const TERMINAL_STATE_ERROR = 'TERMINAL_STATE_ERROR';

const screenFunctions = screenLib({ cursor: '><' });
const autoCloseTerminals = [];

const ERROR_INFO_SUFFIX = 'ErrorInfo';
const ERROR_CODE_SUFFIX = 'Code';
const RETRY_CODES_LIST = ['14058'];
const MD_COMMAND = 'MD';

const DEFAULT_RETRY_TIMES = 3;

const UNEXPECTED_TERMINAL_ERRORS = [
  'NO PREVIOUS OR ORIGINAL REQUEST',
  'OPTIONS ERROR',
];

const isFinancialCommand = (command) => /^F.*/.test(command);

// Adding event handler on beforeExit and exit process events to process open terminals
process.on('beforeExit', () => {
  Promise.all(
    autoCloseTerminals.map(
      ({ state, terminal, log }) => {
        switch (state.terminalState) {
          case TERMINAL_STATE_BUSY:
          case TERMINAL_STATE_READY:
          case TERMINAL_STATE_ERROR:
            if (state.terminalState === TERMINAL_STATE_BUSY) {
              log('UAPI-JSON WARNING: Process exited before completing TerminalService request');
            }
            if (state.sessionToken !== null) {
              log('UAPI-JSON WARNING: Process left TerminalService session open');
              log('UAPI-JSON WARNING: Session closing');
              return terminal.closeSession()
                .then(() => log('UAPI-JSON WARNING: Session closed'))
                .then(() => true)
                .catch(() => false);
            }
            return true;
          default:
            return true;
        }
      }
    )
  ).then(
    (results) => {
      if (results.indexOf(false) !== -1) {
        throw new TerminalRuntimeError.ErrorClosingSession();
      }
    }
  );
});
/* istanbul ignore next */
process.on('exit', () => {
  autoCloseTerminals.forEach(({ state, log }) => {
    switch (state.terminalState) {
      case TERMINAL_STATE_BUSY:
      case TERMINAL_STATE_READY:
      case TERMINAL_STATE_ERROR:
        if (state.terminalState === TERMINAL_STATE_BUSY) {
          log('UAPI-JSON WARNING: Process exited before completing TerminalService request');
        }
        if (state.sessionToken !== null) {
          log('UAPI-JSON WARNING: Process left TerminalService session open');
        }
        break;
      default:
        break;
    }
  });
});

const getErrorTagPrefix = (detailObject) => {
  const [field] = Object.keys(detailObject);
  const [prefix] = field.split(':');

  return prefix;
};

const isErrorRetriable = (e) => {
  if (!e.causedBy || !e.causedBy.data || !e.causedBy.data.detail) {
    return false;
  }

  const { detail } = e.causedBy.data;
  const versionPrefix = getErrorTagPrefix(detail);
  const errorCode = detail[`${versionPrefix}:${ERROR_INFO_SUFFIX}`]
    && detail[`${versionPrefix}:${ERROR_INFO_SUFFIX}`][`${versionPrefix}:${ERROR_CODE_SUFFIX}`];

  return (errorCode && RETRY_CODES_LIST.includes(errorCode));
};

module.exports = function (settings) {
  const {
    timeout = false, debug = 0, autoClose = true,
    auth: { emulatePcc = false, token = null } = {},
    options: { logFunction: log = console.log, uapiErrorHandler = null } = {},
  } = settings;

  const service = terminalService(validateServiceSettings(settings));
  const defaultStopMD = (screens) => !screenFunctions.hasMore(screens);

  const state = {
    terminalState: TERMINAL_STATE_NONE,
    sessionToken: token,
  };

  // Getting session token
  const getSessionToken = async () => {
    // Return error if not in correct state
    if (state.terminalState === TERMINAL_STATE_BUSY) {
      throw new TerminalRuntimeError.TerminalIsBusy();
    }
    if (state.terminalState === TERMINAL_STATE_CLOSED) {
      throw new TerminalRuntimeError.TerminalIsClosed();
    }

    state.terminalState = TERMINAL_STATE_BUSY;

    // Return token if already obtained
    if (state.sessionToken !== null) {
      return state.sessionToken;
    }

    const { sessionToken } = await service.getSessionToken({ timeout });
    state.sessionToken = sessionToken;

    if (!emulatePcc) {
      state.terminalState = TERMINAL_STATE_READY;
      return state.sessionToken;
    }

    const response = await service.executeCommand({
      sessionToken,
      command: `SEM/${emulatePcc}/AG`,
    });

    if (response[0].match(/duty code not authorised/i)) {
      throw new TerminalRuntimeError.TerminalAuthIssue(response);
    }

    if (response[0].match(/INVALID ACCOUNT/)) {
      throw new TerminalRuntimeError.InvalidAccount(response);
    }

    if (!response[0].match(/^PROCEED/)) {
      throw new TerminalRuntimeError.TerminalEmulationFailed(response);
    }

    return sessionToken;
  };

  // Runtime error handling
  const executeCommandWithRetry = async (command, times = DEFAULT_RETRY_TIMES) => {
    const { sessionToken } = state;
    try {
      return await service.executeCommand({ command, sessionToken });
    } catch (e) {
      if (!isErrorRetriable(e) || times <= 0) {
        if (uapiErrorHandler) {
          return uapiErrorHandler(
            executeCommandWithRetry,
            { command, error: e }
          );
        }
        throw e;
      }

      return executeCommandWithRetry(command, times - 1);
    }
  };

  // Processing response with MD commands
  const processResponse = (response, stopMD, previousResponse = null) => {
    const processedResponse = previousResponse
      ? screenFunctions.mergeResponse(
        previousResponse,
        response.join('\n')
      )
      : response.join('\n');

    // Full response is processed no MD commands needed
    if (stopMD(processedResponse)) {
      return processedResponse;
    }

    // Processing MD commands
    return executeCommandWithRetry(MD_COMMAND).then(
      (mdResponse) => (
        mdResponse.join('\n') === response.join('\n')
          ? processedResponse
          : processResponse(mdResponse, stopMD, processedResponse)
      )
    );
  };

  // Get terminal ID
  const getTerminalId = (sessionToken) => getHashSubstr(sessionToken);

  const terminal = {
    getToken: async () => {
      await getSessionToken();
      // Needed here as getSessionToken marks terminal as busy
      state.terminalState = TERMINAL_STATE_READY;
      return state.sessionToken;
    },
    executeCommand: async (command, stopMD = defaultStopMD) => {
      try {
        const sessionToken = await getSessionToken();
        const terminalId = getTerminalId(sessionToken);

        if (debug) {
          log(`[${terminalId}] Terminal request:\n${command}`);
        }

        const screen = await executeCommandWithRetry(command);
        const response = await processResponse(screen, stopMD);

        if (debug) {
          log(`[${terminalId}] Terminal response:\n${response}`);
        }

        Object.assign(state, {
          terminalState: TERMINAL_STATE_READY,
        });

        if (UNEXPECTED_TERMINAL_ERRORS.some((e) => response.includes(e))) {
          const errorObject = isFinancialCommand(command)
            ? new TerminalRuntimeError.TerminalUnexpectedFinancialError({ screen: response })
            : new TerminalRuntimeError.TerminalUnexpectedError({ screen: response });

          throw errorObject;
        }

        return response;
      } catch (err) {
        Object.assign(state, {
          terminalState: TERMINAL_STATE_ERROR,
        });
        throw err;
      }
    },
    closeSession: () => getSessionToken()
      .then(
        (sessionToken) => service.closeSession({
          sessionToken,
        })
      ).then(
        (response) => {
          Object.assign(state, {
            terminalState: TERMINAL_STATE_CLOSED,
          });
          return response;
        }
      ),
  };

  if (autoClose) {
    autoCloseTerminals.push({ state, terminal, log });
  }

  return terminal;
};
