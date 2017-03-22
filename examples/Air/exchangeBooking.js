const uAPI = require('../../index');
const config = require('../../test/testconfig');


const AirService = uAPI.createAirService({
  auth: config,
  debug: 2,
  production: true,
});

const params = {
  pnr: 'CZMC82',
  exchangeToken: 'token',
};

AirService.exchangeBooking(params).then(
  data => console.log(data),
  err => console.log(err)
);
