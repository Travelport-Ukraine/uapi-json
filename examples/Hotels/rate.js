const uAPI = require('../../index');
const config = require('../../test/testconfig');
const moment = require('moment');

const HotelService = uAPI.createHotelService(
  {
    auth: config,
    debug: 2,
    production: true,
  }
);

const search = {
  location: 'LON',
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
};

HotelService.search(search).then(data => {
  const hotelMediaParams = data.hotels[0];
  const rateReq = Object.assign({}, hotelMediaParams, search);
  return HotelService.rates(rateReq);
}).then(
  res => console.log(res),
  err => console.log(err)
);
