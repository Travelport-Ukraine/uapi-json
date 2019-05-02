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
      from: 'LWO',
      to: 'JKT',
      departureDate: '2018-07-18'
    },
    {
      from: 'JKT',
      to: 'IEV',
      departureDate: '2018-07-21',
    },
  ],
  passengers: {
    ADT: 1,
    /*
     CNN:1,
     INF: 1,
     INS: 1, //infant with a seat
     */
  },
  cabins: ['Economy'], // ['Business'],
  requestId: '4e2fd1f8-2221-4b6c-bb6e-cf05c367cf60',
  maxJourneyTime: 300,
  maxSolutions: 200,
  pricing: {
    currency: 'USD',
    // eTicketability: true,
  },
};

AirService.shop(params)
  .then(
    res => console.log(res),
    err => console.log(err)
  );
