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

// Runtime errors
export const TerminalRuntimeError = createErrorClass(
  'TerminalRuntimeError',
  'Terminal service runtime error',
  errorTypes.RuntimeError
);

export default {
  TerminalValidationError,
  TerminalParsingError,
  TerminalRuntimeError,
};
