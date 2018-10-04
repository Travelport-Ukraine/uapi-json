const moment = require('moment');

module.exports = (params) => {
  params.passengers = params.passengers.map((passenger) => {
    const birth = moment(passenger.birthDate.toUpperCase(), 'YYYY-MM-DD');
    passenger.Age = moment().diff(birth, 'years');
    return passenger;
  });
  return params;
};
