import util from 'util';
import { lib as screenLib } from 'galileo-screen';
import {
  TerminalRuntimeError,
} from './TerminalErrors';
import terminalService from './TerminalService';

export const TERMINAL_STATE_NONE = 'TERMINAL_STATE_NONE';
export const TERMINAL_STATE_BUSY = 'TERMINAL_STATE_BUSY';
export const TERMINAL_STATE_READY = 'TERMINAL_STATE_READY';
export const TERMINAL_STATE_CLOSED = 'TERMINAL_STATE_CLOSED';
export const TERMINAL_STATE_ERROR = 'TERMINAL_STATE_ERROR';

const responseHasMoreData = response => (response.slice(-1).join('') === ')><');

module.exports = function (settings) {
  const service = terminalService(settings);
  const emulatePcc = settings.auth.emulatePcc || false;
  const timeout = settings.timeout || false;
  const state = {
    terminalState: TERMINAL_STATE_NONE,
    sessionToken: null,
  };
  // Processing response with MD commands
  const processResponse = (response, previousResponse = []) => {
    const processedResponse = screenLib.mergeLastLinesAtIntersection(
      previousResponse.slice(0, -1),
      response
    );
    if (!responseHasMoreData(response)) {
      return processedResponse.join('\n');
    }
    return service.executeCommand({
      sessionToken: state.sessionToken,
      command: 'MD',
    }).then(
      mdResponse => processResponse(mdResponse, processedResponse)
    );
  };
  // Getting session token
  const getSessionToken = () => new Promise((resolve, reject) => {
    if (state.terminalState === TERMINAL_STATE_BUSY) {
      throw new TerminalRuntimeError.TerminalIsBusy();
    }
    if (state.terminalState === TERMINAL_STATE_CLOSED) {
      throw new TerminalRuntimeError.TerminalIsClosed();
    }
    // Return token if already obtained
    if (state.sessionToken !== null) {
      resolve(state.sessionToken);
      return;
    }
    Object.assign(state, {
      terminalState: TERMINAL_STATE_BUSY,
    });
    // Getting token
    service.getSessionToken({
      timeout,
    }).then((sessionToken) => {
      // Remember sesion token
      Object.assign(state, {
        sessionToken,
      });
      // Return if no emulation needed
      if (!emulatePcc) {
        return sessionToken;
      }
      // Emulate pcc
      return service.executeCommand({
        sessionToken,
        command: `SEM/${emulatePcc}/AG`,
      }).then((response) => {
        if (!response[0].match(/^PROCEED/)) {
          throw new TerminalRuntimeError.TerminalEmulationFailed(response);
        }
        return sessionToken;
      });
    }).then(
      resolve
    ).catch(
      reject
    );
  });

  const terminal = {
    executeCommand: command => getSessionToken()
      .then(
        sessionToken => service.executeCommand({
          command,
          sessionToken,
        })
      )
      .then(
        (response) => {
          Object.assign(state, {
            terminalState: TERMINAL_STATE_READY,
          });
          return response;
        }
      )
      .then(
        response => processResponse(response)
      )
      .catch(
        (err) => {
          Object.assign(state, {
            terminalState: TERMINAL_STATE_ERROR,
          });
          throw err;
        }
      ),
    closeSession: () => getSessionToken()
      .then(
        sessionToken => service.closeSession({
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

  // Adding event handler on beforeExit and exit process events
  process.on('beforeExit', () => {
    switch (state.terminalState) {
      case TERMINAL_STATE_BUSY:
      case TERMINAL_STATE_READY:
      case TERMINAL_STATE_ERROR:
        if (state.terminalState === TERMINAL_STATE_BUSY) {
          util.log('UAPI-JSON WARNING: Process exited before completing TerminalService request');
        }
        if (state.sessionToken !== null) {
          util.log('UAPI-JSON WARNING: Process left TerminalService session open');
          util.log('UAPI-JSON WARNING: Session closing');
          terminal.closeSession().then(
            () => util.log('UAPI-JSON WARNING: Session closed')
          ).catch(
            () => {
              util.log('UAPI-JSON WARNING: Error closing session');
              process.exit(1);
            }
          );
        }
        break;
      default:
        break;
    }
  });
  process.on('exit', () => {
    switch (state.terminalState) {
      case TERMINAL_STATE_BUSY:
      case TERMINAL_STATE_READY:
      case TERMINAL_STATE_ERROR:
        if (state.terminalState === TERMINAL_STATE_BUSY) {
          util.log('UAPI-JSON WARNING: Process exited before completing TerminalService request');
        }
        if (state.sessionToken !== null) {
          util.log('UAPI-JSON WARNING: Process left TerminalService session open');
        }
        break;
      default:
        break;
    }
  });


  return terminal;
};
