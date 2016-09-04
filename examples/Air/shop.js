const uAPI = require('../../index');
const config = require('../../test/testconfig');

const AirService = uAPI.createAirService(
  {
    auth: config,
    debug: 2,
    production: true,
  }
);


const params = {
  legs: [
    {
      from: 'IEV',
      to: 'PAR',
      departureDate: '2016-11-10',
    },
    {
      from: 'PAR',
      to: 'IEV',
      departureDate: '2016-11-20',
    },
  ],
  passengers: {
    ADT: 1,
  },
  requestId: 'test-request',
};

AirService.shop(params)
  .then(
    res => console.log(res),
    err => console.log(err)
  );
