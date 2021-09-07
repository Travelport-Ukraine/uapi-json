const uAPI = require('../../index');
const config = require('../../test/testconfig');


const AirService = uAPI.createAirService({
  auth: config,
  debug: 2,
  production: true,
});

const params = {
  // pnr: '03TLGV',
  emdNumber: '0809991187192',
};

AirService.getEMDItem(params).then(
  data => console.log(data),
  err => console.log(err)
);
