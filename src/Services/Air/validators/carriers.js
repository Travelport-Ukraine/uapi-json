const { AirValidationError } = require('../AirErrors');

const carrierRegExp = /^[A-Z0-9]{2}$/;

module.exports = (params) => {
  const { permittedCarriers, preferredCarriers } = params;
  const carriers = permittedCarriers || preferredCarriers;

  if (
    permittedCarriers !== undefined
    && preferredCarriers !== undefined
  ) {
    throw new AirValidationError.SingleCarriesTypeIsAllowed(params);
  }

  if (
    carriers !== undefined
    && (
      !Array.isArray(carriers)
      || carriers.length === 0
      || carriers.some(c => !carrierRegExp.test(c))
    )
  ) {
    throw new AirValidationError.CarriersIsInvalid(params);
  }
};
