const {
  createErrorClass,
  createErrorsList,
} = require('node-errors-helpers');
const errorTypes = require('../../error-types');
const errorCodes = require('../../error-codes');

// Validation errors
const TerminalValidationError = createErrorClass(
  'TerminalValidationError',
  ['Terminal service validation error', errorCodes.Validation],
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
const TerminalParsingError = createErrorClass(
  'TerminalParsingError',
  ['Terminal service parsing error', errorCodes.GdsFailure],
  errorTypes.ParsingError
);
Object.assign(TerminalParsingError, createErrorsList({
  TerminalSessionTokenMissing: 'Terminal session token is missing in service response',
  TerminalResponseMissing: 'Terminal response is missing in service response',
}, TerminalParsingError));

// Runtime errors
const TerminalRuntimeError = createErrorClass(
  'TerminalRuntimeError',
  ['Terminal service runtime error', errorCodes.GdsFailure],
  errorTypes.RuntimeError
);
Object.assign(TerminalRuntimeError, createErrorsList({
  TerminalEmulationFailed: 'Terminal emulation failed',
  TerminalCloseSessionFailed: 'Failed to close terminal session',
  TerminalIsBusy: 'Terminal is busy',
  TerminalIsClosed: 'Terminal is closed',
  ErrorClosingSession: 'Error closing session',
  NoAgreement: ['There is no agreement between current pcc and you trying to reach', errorCodes.Unauthorized],
}, TerminalRuntimeError));

module.exports = {
  TerminalValidationError,
  TerminalParsingError,
  TerminalRuntimeError,
};
