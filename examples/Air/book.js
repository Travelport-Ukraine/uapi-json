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
    (results) => {
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
          birthDate: '1968-07-25',
          gender: 'M',
          ageCategory: 'ADT',
        }],
        phone: {
          countryCode: '38',
          location: 'IEV',
          number: '0660419905',
        },
        deliveryInformation: {
          name: 'Anakin Skywalker',
          street: 'Sands street, 42',
          zip: '42042',
          country: 'Galactic Empire',
          city: 'Mos Eisley',
        },
      };

      return AirService.book(book).then(
        res => console.log(res),
        err => console.log(err)
      );
    }
  )
  .catch(
    err => console.log('err', err)
  );
