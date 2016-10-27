import {
  TerminalRuntimeError,
  TerminalParsingError,
} from './TerminalErrors';

const errorHandler = (rsp) => {
  console.log(rsp);
  throw new TerminalRuntimeError();
};

const createSession = (rsp) => {
  if (
    !rsp['common_v33_0:HostToken'] ||
    !rsp['common_v33_0:HostToken']._
  ) {
    throw new TerminalParsingError.TerminalSessionTokenMissing();
  }
  return rsp['common_v33_0:HostToken']._;
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
    !rsp['common_v33_0:ResponseMessage'] ||
    !rsp['common_v33_0:ResponseMessage'][0] ||
    !rsp['common_v33_0:ResponseMessage'][0]._ ||
    !rsp['common_v33_0:ResponseMessage'][0]._.match(/Terminal End Session Successful/i)
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
