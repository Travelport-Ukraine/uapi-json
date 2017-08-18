import {
  createErrorClass,
  createErrorsList,
} from 'node-errors-helpers';
import errorTypes from '../../error-types';

// Validation errors
export const UtilsValidationError = createErrorClass(
  'UtilsValidationError',
  'Utils service validation error',
  errorTypes.ValidationError
);
Object.assign(UtilsValidationError, createErrorsList({
  CurrenciesMissing: 'Missing currencies',
}, UtilsValidationError));

// Parsing errors
export const UtilsParsingError = createErrorClass(
  'UtilsParsingError',
  'Utils service parsing error',
  errorTypes.ParsingError
);

// Runtime errors
export const UtilsRuntimeError = createErrorClass(
  'UtilsRuntimeError',
  'Utils service runtime error',
  errorTypes.RuntimeError
);

export default {
  UtilsValidationError,
  UtilsParsingError,
  UtilsRuntimeError,
};
