const uApiRequest = require('../../Request/uapi-request');
const TerminalParser = require('./TerminalParser');
const TerminalValidator = require('./TerminalValidator');
const getConfig = require('../../config');

const templates = require('./templates');

module.exports = function (settings) {
  const {
    auth, debug, production, options
  } = settings;
  const config = getConfig(auth.region, production);

  return {
    getSessionToken: uApiRequest(
      config.TerminalService.url,
      auth,
      templates.createSession,
      'terminal:CreateTerminalSessionRsp',
      TerminalValidator.CREATE_SESSION,
      TerminalParser.TERMINAL_ERROR,
      TerminalParser.CREATE_SESSION,
      debug,
      options
    ),
    executeCommand: uApiRequest(
      config.TerminalService.url,
      auth,
      templates.request,
      'terminal:TerminalRsp',
      TerminalValidator.TERMINAL_REQUEST,
      TerminalParser.TERMINAL_ERROR,
      TerminalParser.TERMINAL_REQUEST,
      debug,
      options
    ),
    closeSession: uApiRequest(
      config.TerminalService.url,
      auth,
      templates.closeSession,
      'terminal:EndTerminalSessionRsp',
      TerminalValidator.CLOSE_SESSION,
      TerminalParser.TERMINAL_ERROR,
      TerminalParser.CLOSE_SESSION,
      debug,
      options
    ),
  };
};
