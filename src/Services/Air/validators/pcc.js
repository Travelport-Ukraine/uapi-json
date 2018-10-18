const { GdsValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (params.pcc === undefined) {
    throw new GdsValidationError.PccMissing(params);
  }
};
