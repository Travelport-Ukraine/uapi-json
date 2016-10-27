const uApiRequest = require('../../Request/uapi-request');
const TerminalParser = require('./TerminalParser');
const TerminalValidator = require('./TerminalValidator');
const getConfig = require('../../config');

const templatesDir = `${__dirname}/templates`;

module.exports = function (settings) {
  const { auth, debug, production } = settings;
  const config = getConfig(auth.region, production);

  return {
    getSessionToken: uApiRequest(
      config.TerminalService.url,
      auth,
      `${templatesDir}/TERMINAL_CREATE_SESSION.xml`,
      'terminal:CreateTerminalSessionRsp',
      TerminalValidator.CREATE_SESSION,
      TerminalParser.TERMINAL_ERROR,
      TerminalParser.CREATE_SESSION,
      debug
    ),
    executeCommand: uApiRequest(
      config.TerminalService.url,
      auth,
      `${templatesDir}/TERMINAL_REQUEST.xml`,
      'terminal:TerminalRsp',
      TerminalValidator.TERMINAL_REQUEST,
      TerminalParser.TERMINAL_ERROR,
      TerminalParser.TERMINAL_REQUEST,
      debug
    ),
    closeSession: uApiRequest(
      config.TerminalService.url,
      auth,
      `${templatesDir}/TERMINAL_CLOSE_SESSION.xml`,
      'terminal:EndTerminalSessionRsp',
      TerminalValidator.CLOSE_SESSION,
      TerminalParser.TERMINAL_ERROR,
      TerminalParser.CLOSE_SESSION,
      debug
    ),
  };
};
