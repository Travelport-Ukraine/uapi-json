import {
  TerminalRuntimeError,
} from './TerminalErrors';
import terminalService from './TerminalService';

module.exports = function (settings) {
  const service = terminalService(settings);
  const emulatePcc = settings.emulatePcc || false;
  const timeout = settings.timeout || false;
  const state = {
    sessionToken: null,
  };
  const getSessionToken = new Promise((resolve, reject) => {
    // Return token if already obtained
    if (state.sessionToken !== null) {
      resolve(state.sessionToken);
      return;
    }
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
        resolve(sessionToken);
        return;
      }
      // Emulate pcc
      service.executeCommand({
        sessionToken,
        command: `SEM/${emulatePcc}/AG`,
      }).then((response) => {
        if (!response[0].match(/^PROCEED/)) {
          reject(new TerminalRuntimeError.TerminalEmulationFailed(response));
          return;
        }
        resolve(sessionToken);
      });
    }).catch(reject);
  });
  return {
    executeCommand: options => getSessionToken.then(
      sessionToken => service.executeCommand(Object.assign(options, {
        sessionToken,
      }))
    ),
    closeSession: () => getSessionToken.then(
      sessionToken => service.closeSession({
        sessionToken,
      })
    ),
  };
};
