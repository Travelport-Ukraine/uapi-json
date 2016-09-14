const uAPI = require('../../src');
const config = require('../../test/testconfig');
const moment = require('moment');

const HotelService = uAPI.createHotelService(
  {
    auth: config,
    debug: 2,
    production: true,
  }
);

HotelService.search({
  code: 'RUAACL',
  // location: 'IEV', use for IATA codes search
  startDate: moment().add(30, 'days').format('YYYY-MM-DD'),
  endDate: moment().add(35, 'days').format('YYYY-MM-DD'),
  currency: 'USD',
  MaxWait: 30000,
  MaxProperties: 9999,
  rooms: [{
    adults: 1,
  }, {
    adults: 2,
  }],
  rating: [3, 5],
}).then(
  res => console.log(res),
  err => console.log(err)
);
