const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (params.email) {
    if (Object.prototype.toString.call(params.email) !== '[object String]') {
      throw new AirValidationError.IncorrectEmail(params);
    }
  }
};
