const { GdsValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (params.pnr === undefined) {
    throw new GdsValidationError.PnrMissing(params);
  }
};
