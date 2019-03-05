const uAPI = require('../../index');
const config = require('../../test/testconfig');

const AirService = uAPI.createAirService(
  {
    auth: config,
    debug: 2,
    production: false,
  }
);
const AirServiceQuiet = uAPI.createAirService(
  {
    auth: config,
    production: false,
  }
);

const requestPTC = 'ADT';

const shop_params = {
  legs: [
    {
      from: 'LOS',
      to: 'IST',
      departureDate: '2019-06-18',
    },
    {
      from: 'IST',
      to: 'LOS',
      departureDate: '2019-06-21',
    },
  ],
  passengers: {
    [requestPTC]: 1,
  },
  cabins: ['Economy'],
  requestId: 'test',
};

AirServiceQuiet.shop(shop_params)
  .then((results) => {
    const forwardSegments = results['0'].directions['0']['0'].segments;
    const backSegments = results['0'].directions['1']['0'].segments;

    const farerules_params = {
      segments: forwardSegments.concat(backSegments),
      passengers: shop_params.passengers,
      long: true,
      requestId: 'test',
    };

    return AirService.fareRules(farerules_params);
  })
  .then(
    (res) => {
      console.log(JSON.stringify(res));
    },
    err => console.error(err)
  ).catch((err) => {
    console.error(err);
  });
