import {
  createErrorClass,
  createErrorsList,
} from 'node-errors-helpers';
import errorTypes from '../../error-types';

// Validation errors
export const TerminalValidationError = createErrorClass(
  'TerminalValidationError',
  'Terminal service validation error',
  errorTypes.ValidationError
);
Object.assign(TerminalValidationError, createErrorsList({
  ParamsMissing: 'Params are missing',
  ParamsInvalidType: 'Params should be passed as object',
  CommandMissing: 'Command is missing',
  CommandInvalid: 'Command is invalid',
  SessionTokenMissing: 'Session token is missing',
  SessionTokenInvalid: 'Session token is invalid',
  SessionTimeoutInvalid: 'Session timeout value is invalid',
  SessionTimeoutTooLow: 'Timeout value must be positive integer',
}, TerminalValidationError));

// Parsing errors
export const TerminalParsingError = createErrorClass(
  'TerminalParsingError',
  'Terminal service parsing error',
  errorTypes.ParsingError
);
Object.assign(TerminalParsingError, createErrorsList({
  TerminalSessionTokenMissing: 'Terminal session token is missing in service response',
  TerminalResponseMissing: 'Terminal response is missing in service response',
}, TerminalParsingError));

// Runtime errors
export const TerminalRuntimeError = createErrorClass(
  'TerminalRuntimeError',
  'Terminal service runtime error',
  errorTypes.RuntimeError
);
Object.assign(TerminalRuntimeError, createErrorsList({
  TerminalEmulationFailed: 'Terminal emulation failed',
  TerminalCloseSessionFailed: 'Failed to close terminal session',
  TerminalIsBusy: 'Terminal is busy',
  TerminalIsClosed: 'Terminal is closed',
  ErrorClosingSession: 'Error closing session',
}, TerminalRuntimeError));

export default {
  TerminalValidationError,
  TerminalParsingError,
  TerminalRuntimeError,
};
