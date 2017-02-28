import { createErrorClass } from 'node-errors-helpers';

const errors = {
  RuntimeError: createErrorClass('RuntimeError', 'Runtime error occured'),
  ValidationError: createErrorClass('ValidationError', 'Validation error occured'),
  ParsingError: createErrorClass('ParsingError', 'Parsing error occured'),
  SoapError: createErrorClass('SoapError', 'Error occurred while executing SOAP call'),
};

export default errors;
