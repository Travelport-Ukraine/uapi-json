const Joi = require('@hapi/joi');
const { ValidationError } = require('../error-types');

module.exports = (joiV, Class) => (params) => {
  try {
    const schema = typeof joiV === 'function'
      ? joiV(params)
      : joiV;

    return Joi.attempt(params, schema);
  } catch (e) {
    if (e instanceof ValidationError) {
      throw e;
    }

    if (Class) {
      throw new Class(params, e);
    }

    throw new ValidationError(params, e);
  }
};
