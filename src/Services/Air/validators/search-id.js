const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (!params.searchId) {
    throw new AirValidationError.SearchIdMissing();
  }
};
