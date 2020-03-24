const {
  createErrorClass,
  createErrorsList,
} = require('node-errors-helpers');
const errorTypes = require('../error-types');

// Validation errors
const RequestValidationError = createErrorClass(
  'RequestValidationError',
  'Request validation error',
  errorTypes.ValidationError
);
Object.assign(RequestValidationError, createErrorsList({
  ServiceUrlMissing: 'Service URL is missing',
  AuthDataMissing: 'Auth data is missing',
  ParamsMissing: 'Params for function are missing',
  RequestTypeUndefined: 'Undefined request type',
}, RequestValidationError));

// Runtime errors
const RequestRuntimeError = createErrorClass(
  'RequestRuntimeError',
  'Request runtime error',
  errorTypes.RuntimeError
);
Object.assign(RequestRuntimeError, createErrorsList({
  TemplateFileMissing: 'XML template not found for request',
  VersionParsingError: 'Error during parsing version of uapi',
  UnhandledError: 'Error during request. Please try again later',
  ResultsMissing: 'Missing results in response',
}, RequestRuntimeError));

// Soap errors
const RequestSoapError = createErrorClass(
  'RequestSoapError',
  'Request SOAP error',
  errorTypes.SoapError
);
Object.assign(RequestSoapError, createErrorsList({
  SoapUnexpectedError: 'Unexpected error during soap request',
  SoapRequestError: 'Error during request to SOAP API. Check url validity',
  SoapParsingError: 'SOAP response parsing failed',
  SoapServerError: 'SOAP server error. Check auth and other data',
}, RequestSoapError));

module.exports = {
  RequestValidationError,
  RequestRuntimeError,
  RequestSoapError,
};
