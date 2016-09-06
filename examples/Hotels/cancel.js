const uAPI = require('../../index');
const config = require('../../test/testconfig');

const HotelService = uAPI.createHotelService(
  {
    auth: config,
    debug: 2,
    production: true,
  }
);

HotelService.cancelBook({
  LocatorCode: 'ABCDEF'
}).then(
  res => console.log(res),
  err => console.log(err)
);
