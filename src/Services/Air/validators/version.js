const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (
    params.version === undefined
    || Object.prototype.toString.call((params.version)) !== '[object Number]'
  ) {
    throw new AirValidationError.VersionMissing(params);
  }
};
