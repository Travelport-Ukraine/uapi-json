const Joi = require('@hapi/joi');

module.exports = Joi.string().length(3).regex(/[A-Z]/);
