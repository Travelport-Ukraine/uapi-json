import {
  createErrorClass,
  createErrorsList,
} from 'node-errors-helpers';
import errorTypes from '../error-types';

// Validation errors
export const RequestValidationError = createErrorClass(
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
export const RequestRuntimeError = createErrorClass(
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
export const RequestSoapError = createErrorClass(
  'RequestSoapError',
  'Request SOAP error',
  errorTypes.SoapError
);
Object.assign(RequestSoapError, createErrorsList({
  SoapRequestError: 'Error during request to SOAP API. Check url validity',
  SoapParsingError: 'SOAP response parsing failed',
  SoapServerError: 'SOAP server error. Check auth and other data',
}, RequestSoapError));

export default {
  RequestValidationError,
  RequestRuntimeError,
  RequestSoapError,
};
