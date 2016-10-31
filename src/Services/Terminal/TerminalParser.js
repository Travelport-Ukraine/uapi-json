import {
  TerminalRuntimeError,
  TerminalParsingError,
} from './TerminalErrors';

const errorHandler = (rsp) => {
  throw new TerminalRuntimeError(rsp);
};

const createSession = (rsp) => {
  if (
    !rsp[`common_${this.uapi_version}:HostToken`] ||
    !rsp[`common_${this.uapi_version}:HostToken`]._
  ) {
    throw new TerminalParsingError.TerminalSessionTokenMissing();
  }
  return rsp[`common_${this.uapi_version}:HostToken`]._;
};

const terminalRequest = (rsp) => {
  if (
    !rsp['terminal:TerminalCommandResponse'] ||
    !rsp['terminal:TerminalCommandResponse']['terminal:Text']
  ) {
    throw new TerminalParsingError.TerminalResponseMissing();
  }
  return rsp['terminal:TerminalCommandResponse']['terminal:Text'];
};

const closeSession = (rsp) => {
  if (
    !rsp[`common_${this.uapi_version}:ResponseMessage`] ||
    !rsp[`common_${this.uapi_version}:ResponseMessage`][0] ||
    !rsp[`common_${this.uapi_version}:ResponseMessage`][0]._ ||
    !rsp[`common_${this.uapi_version}:ResponseMessage`][0]._.match(/Terminal End Session Successful/i)
  ) {
    throw new TerminalRuntimeError.TerminalCloseSessionFailed();
  }
  return true;
};

module.exports = {
  TERMINAL_ERROR: errorHandler,
  CREATE_SESSION: createSession,
  TERMINAL_REQUEST: terminalRequest,
  CLOSE_SESSION: closeSession,
};
