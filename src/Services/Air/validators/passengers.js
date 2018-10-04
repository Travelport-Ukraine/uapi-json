const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (Object.prototype.toString.call(params.passengers) !== '[object Object]') {
    throw new AirValidationError.PassengersHashMissing(params);
  }

  Object.keys(params.passengers).forEach((ageCategory) => {
    const number = params.passengers[ageCategory];
    if (Object.prototype.toString.call(ageCategory) !== '[object String]'
      || ageCategory.length !== 3
    ) {
      throw new AirValidationError.PassengersCategoryInvalid(params);
    }

    if (Object.prototype.toString.call(number) !== '[object Number]') {
      throw new AirValidationError.PassengersCountInvalid(params);
    }
  });
};
