const Joi = require('@hapi/joi');
const wrapJoi = require('../../../utils/joiWrapper');
const iataCode = require('./schemas/iata-code');

const { AirValidationError } = require('../AirErrors');

const connectionsFields = [
  'preferredConnectionPoints',
  'permittedConnectionPoints',
  'prohibitedConnectionPoints',
];

module.exports = wrapJoi(
  Joi
    .object()
    .pattern(
      Joi.string().valid(...connectionsFields), // dynamic keys validator
      Joi.array().items(iataCode).min(1) // values validator
    )
    .unknown(),
  AirValidationError.IncorrectConnectionsFormat
);
