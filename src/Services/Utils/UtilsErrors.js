const {
  createErrorClass,
  createErrorsList,
} = require('node-errors-helpers');
const errorTypes = require('../../error-types');

// Validation errors
const UtilsValidationError = createErrorClass(
  'UtilsValidationError',
  'Utils service validation error',
  errorTypes.ValidationError
);
Object.assign(UtilsValidationError, createErrorsList({
  CurrenciesMissing: 'Missing currencies',
  DataTypeMissing: 'Missing dataType',
}, UtilsValidationError));

// Parsing errors
const UtilsParsingError = createErrorClass(
  'UtilsParsingError',
  'Utils service parsing error',
  errorTypes.ParsingError
);

// Runtime errors
const UtilsRuntimeError = createErrorClass(
  'UtilsRuntimeError',
  'Utils service runtime error',
  errorTypes.RuntimeError
);

module.exports = {
  UtilsValidationError,
  UtilsParsingError,
  UtilsRuntimeError,
};
