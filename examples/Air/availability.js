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
      to: 'NYC',
      departureDate: '2018-11-10',
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
  carriers: ['KL'],
  cabins: ['Economy'], // ['Business'],
  requestId: '4e2fd1f8-2221-4b6c-bb6e-cf05c367cf60',
  // permittedConnectionPoints: ['AMS'],
  // preferredConnectionPoints: ['KBP'],
  // prohibitedConnectionPoints: ['DME', 'SVO', 'PAR'],
  // maxJourneyTime: 300,
  // pricing: {
    // currency: 'USD',
    // eTicketability: true,
  // },
};

AirService.availability(params)
  .then(
    res => console.log(res),
    err => console.log(err)
  );
