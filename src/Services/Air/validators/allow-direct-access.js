const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  const { allowDirectAccess, permittedCarriers } = params;
  if (allowDirectAccess !== undefined && (typeof allowDirectAccess) !== 'boolean') {
    throw new AirValidationError.AllowDirectAccessInvalid(params);
  }
  if (allowDirectAccess && (!Array.isArray(permittedCarriers) || permittedCarriers.length === 0)) {
    throw new AirValidationError.AllowDirectAccessCarriersNotSpecified(params);
  }
};
