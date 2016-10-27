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
}, TerminalRuntimeError));

export default {
  TerminalValidationError,
  TerminalParsingError,
  TerminalRuntimeError,
};
