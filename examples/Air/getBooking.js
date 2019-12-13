const uAPI = require('../../index');
const config = require('../../test/testconfig');


const AirService = uAPI.createAirService({
  auth: config,
  debug: 2,
  production: true,
});

const params = {
  pnr: 'BMNMLK',
};

AirService.getBooking(params).then(
  data => console.log(data),
  err => console.log(err)
);
