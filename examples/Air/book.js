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

AirService.shop(params).then(trips => {
  const book = {
    segments: trips['0'].Directions['0']['0'].Segments,
    passengers: [{
      lastName: 'ENEKEN',
      firstName: 'SKYWALKER',
      passCountry: 'UA',
      passNumber: 'ES221731',
      birthDate: '25JUL68',
      gender: 'M',
      ageCategory: 'ADT',
    }, {
      lastName: 'DARTH',
      firstName: 'VAIDER',
      passCountry: 'UA',
      passNumber: 'ES221731',
      birthDate: '25JUL66',
      gender: 'M',
      ageCategory: 'ADT',
    }, {
      lastName: 'ENEKENJS',
      firstName: 'SKYWALKERJS',
      passCountry: 'UA',
      passNumber: 'ES221731',
      birthDate: '25JUL05',
      gender: 'M',
      ageCategory: 'CNN',
    }],
  };

  return AirService.book(book).then(
      res => console.log(res),
      err => console.log(err)
    );
}).catch(err => console.log('err', err));
