const { createErrorClass, createErrorsList } = require('node-errors-helpers');

const ServiceError = createErrorClass('ServiceError', 'General service error');
Object.assign(ServiceError, createErrorsList({
  ServiceParamsMissing: 'Service params are missing',
  ServiceParamsInvalid: 'Service params invalid',
  ServiceParamsAuthMissing: 'Service params.auth is missing',
  ServiceParamsAuthInvalid: 'Service params.auth is invalid',
}, ServiceError));

const errors = {
  RuntimeError: createErrorClass('RuntimeError', 'Runtime error occurred'),
  ValidationError: createErrorClass('ValidationError', 'Validation error occurred'),
  ParsingError: createErrorClass('ParsingError', 'Parsing error occurred'),
  SoapError: createErrorClass('SoapError', 'Error occurred while executing SOAP call'),
  ServiceError,
};

module.exports = errors;
