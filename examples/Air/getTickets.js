const uAPI = require('../../index');
const config = require('../../test/testconfig');


const AirService = uAPI.createAirService({
  auth: config,
  debug: 2,
  production: true,
});

const params = {
  reservationLocatorCode: 'RLC001',
};

AirService.getTickets(params).then(
  data => console.log(data),
  err => console.log(err)
);
