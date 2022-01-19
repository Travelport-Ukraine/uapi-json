const uAPI = require('../../index');
const config = require('../../test/testconfig');

const AirService = uAPI.createAirService({
  auth: config,
  debug: 2,
  production: false,
});

const params = {
  seatSegment: [
    {
      from: 'ADD',
      to: 'CAI',
      group: 0,
      departure: '2022-02-15T04:05:00.000+03:00',
      arrival: '2022-02-15T06:40:00.000+02:00',
      airline: 'MS',
      flightNumber: '852',
      uapi_segment_ref: 'MxzYH5AqWDKADt34EAAAAA==',
      serviceClass: 'Economy',
      plane: ['738'],
      duration: ['215'],
      techStops: [],
      bookingClass: 'S',
      baggage: [
        {
          units: 'piece',
          amount: 2,
        },
      ],
      fareBasisCode: 'SRIMSO',
    },
    {
      from: 'CAI',
      to: 'IST',
      group: 0,
      departure: '2022-02-15T09:40:00.000+02:00',
      arrival: '2022-02-15T13:00:00.000+03:00',
      airline: 'MS',
      flightNumber: '737',
      uapi_segment_ref: 'MxzYH5AqWDKAFt34EAAAAA==',
      serviceClass: 'Economy',
      plane: ['32N'],
      duration: ['140'],
      techStops: [],
      bookingClass: 'S',
      baggage: [
        {
          units: 'piece',
          amount: 2,
        },
      ],
      fareBasisCode: 'SLRIEGO',
    },
  ],
};

AirService.seat(params).then(
  (data) => { console.log(data); },
  (err) => { console.log(err); }
);
