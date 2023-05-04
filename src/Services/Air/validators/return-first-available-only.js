const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  const { returnFirstAvailableOnly } = params;
  if (returnFirstAvailableOnly !== undefined && (typeof returnFirstAvailableOnly) !== 'boolean') {
    throw new AirValidationError.ReturnFirstAvailableOnlyInvalid(params);
  }
};
