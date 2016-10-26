import terminalService from './TerminalService';

module.exports = function (settings) {
  const service = terminalService(settings);
  const state = {
    sessionToken: null,
  };
  const getSessionToken = new Promise((resolve) => {
    if (state.sessionToken !== null) {
      return resolve(state.sessionToken);
    }
    return service.getSessionToken().then((sessionToken) => {
      Object.assign(state, {
        sessionToken,
      });
      return sessionToken;
    });
  });
  return {
    executeCommand: options => getSessionToken.then(
      sessionToken => service.executeCommand(Object.assign(options, { sessionToken }))
    ),
  };
};
