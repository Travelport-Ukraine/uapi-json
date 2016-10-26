const uApiRequest = require('../../Request/uapi-request');
const TerminalParser = require('./TerminalParser');
const TerminalValidator = require('./TerminalValidator');
const getConfig = require('../../config');

const templatesDir = `${__dirname}/templates`;

module.exports = function (settings) {
  const { auth, debug, production } = settings;
  const config = getConfig(auth.region, production);
  return {
    createSession: uApiRequest(
      config.TerminalService.url,
      auth,
      `${templatesDir}/TERMINAL_CREATE_SESSION.xml`,
      null,
      TerminalValidator.CREATE,
      TerminalParser.TERMINAL_ERROR,
      TerminalParser.CREATE,
      debug
    ),
  };
};
