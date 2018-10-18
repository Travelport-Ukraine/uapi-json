const {
  TerminalRuntimeError,
  TerminalParsingError,
} = require('./TerminalErrors');
const {
  RequestRuntimeError,
} = require('../../Request/RequestErrors');
const utils = require('../../utils');

function errorHandler(rsp) {
  let errorInfo;
  let code;
  let faultString;
  try {
    errorInfo = rsp.detail[`common_${this.uapi_version}:ErrorInfo`];
    code = errorInfo[`common_${this.uapi_version}:Code`];
    faultString = rsp.faultstring;
  } catch (err) {
    throw new RequestRuntimeError.UnhandledError(null, new TerminalRuntimeError(rsp));
  }
  switch (code) {
    case '345':
      throw new TerminalRuntimeError.NoAgreement({
        screen: faultString,
        pcc: utils.getErrorPcc(rsp.faultstring),
      });
    default:
      throw new RequestRuntimeError.UnhandledError(null, new TerminalRuntimeError(rsp));
  }
}

function createSession(rsp) {
  if (
    !rsp[`common_${this.uapi_version}:HostToken`]
    || !rsp[`common_${this.uapi_version}:HostToken`]._
  ) {
    throw new TerminalParsingError.TerminalSessionTokenMissing();
  }
  return { sessionToken: rsp[`common_${this.uapi_version}:HostToken`]._ };
}

function terminalRequest(rsp) {
  if (
    !rsp['terminal:TerminalCommandResponse']
    || !rsp['terminal:TerminalCommandResponse']['terminal:Text']
  ) {
    throw new TerminalParsingError.TerminalResponseMissing();
  }
  return rsp['terminal:TerminalCommandResponse']['terminal:Text'];
}

function closeSession(rsp) {
  if (
    !rsp[`common_${this.uapi_version}:ResponseMessage`]
    || !rsp[`common_${this.uapi_version}:ResponseMessage`][0]
    || !rsp[`common_${this.uapi_version}:ResponseMessage`][0]._
    || !rsp[`common_${this.uapi_version}:ResponseMessage`][0]._.match(/Terminal End Session Successful/i)
  ) {
    throw new TerminalRuntimeError.TerminalCloseSessionFailed();
  }
  return true;
}

module.exports = {
  TERMINAL_ERROR: errorHandler,
  CREATE_SESSION: createSession,
  TERMINAL_REQUEST: terminalRequest,
  CLOSE_SESSION: closeSession,
};
