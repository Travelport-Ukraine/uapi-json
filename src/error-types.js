const createErrorClass = require('node-errors-helpers').createErrorClass;

const errors = {
  RuntimeError: createErrorClass('RuntimeError', 'Runtime error occured'),
  ValidationError: createErrorClass('ValidationError', 'Validation error occured'),
  ParsingError: createErrorClass('ParsingError', 'Parsing error occured'),
  SoapError: createErrorClass('SoapError', 'Error occurred while executing SOAP call'),
};

module.exports = errors;
