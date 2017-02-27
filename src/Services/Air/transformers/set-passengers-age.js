import moment from 'moment';

export default (params) => {
  params.passengers = params.passengers.map((passenger) => {
    const birth = moment(passenger.birthDate.toUpperCase(), 'YYYYMMDD');
    passenger.Age = moment().diff(birth, 'years');
    return passenger;
  });
  return params;
};
