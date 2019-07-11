const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (Object.prototype.toString.call((params.universalRecordLocatorCode)) !== '[object String]') {
    throw new AirValidationError.UniversalRecordLocatorCode(params);
  }
};
