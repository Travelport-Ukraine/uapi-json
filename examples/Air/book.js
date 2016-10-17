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

AirService.shop(params).then(results => {
  const fromSegments = results['0'].Directions['0']['0'].Segments;
  const toSegments = results['0'].Directions['1']['0'].Segments;

  const book = {
    segments: fromSegments.concat(toSegments),
    rule: 'SIP',
    passengers: [{
      lastName: 'ANAKIN',
      firstName: 'SKYWALKER',
      passCountry: 'UA',
      passNumber: 'ES221731',
      birthDate: '19680725',
      gender: 'M',
      ageCategory: 'ADT',
    }, {
      lastName: 'DARTH',
      firstName: 'VAIDER',
      passCountry: 'UA',
      passNumber: 'ES221731',
      birthDate: '19660725',
      gender: 'M',
      ageCategory: 'ADT',
    }, {
      lastName: 'ANAKINJR',
      firstName: 'SKYWALKER',
      passCountry: 'UA',
      passNumber: 'ES221731',
      birthDate: '20050725',
      gender: 'M',
      ageCategory: 'CNN',
    }],
  };

  return AirService.book(book).then(
      res => console.log(res),
      err => console.log(err)
    );
}).catch(err => console.log('err', err));
