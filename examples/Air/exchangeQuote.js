const uAPI = require('../../index');
const config = require('../../test/testconfig');


const AirService = uAPI.createAirService({
  auth: config,
  debug: 2,
  production: true,
});

const params = {
  pnr: '7WG360',
  segments: [
    {
      from: 'DXB',
      to: 'DEL',
      departure: '2017-03-15T06:00:00.000+04:00',
      arrival: '2017-03-15T10:45:00.000+05:30',
      airline: '9W',
      flightNumber: '587',
      serviceClass: 'Economy',
      uapi_segment_ref: 'AWw4spBAAA/B14ADtOAAAA==',
      plane: ['73H'],
      duration: ['195'],
      techStops: [],
      status: 'HK',
      bookingClass: 'O'
    },
    {
      from: 'DEL',
      to: 'BKK',
      departure: '2017-03-15T14:30:00.000+05:30',
      arrival: '2017-03-15T20:05:00.000+07:00',
      airline: '9W',
      flightNumber: '66',
      serviceClass: 'Economy',
      uapi_segment_ref: 'AWw4spBAAA/B34ADtOAAAA==',
      plane: ['739'],
      duration: ['245'],
      techStops: [],
      status: 'HK',
      bookingClass: 'O'
    },
    {
      from: 'BKK',
      to: 'BOM',
      departure: '2017-04-20T15:25:00.000+07:00',
      arrival: '2017-04-20T18:35:00.000+05:30',
      airline: '9W',
      flightNumber: '69',
      serviceClass: 'Economy',
      uapi_segment_ref: 'AWw4spBAAA/B54ADtOAAAA==',
      plane: ['333'],
      duration: ['280'],
      techStops: [],
      status: 'HK',
      bookingClass: 'V'
    },
    {
      from: 'BOM',
      to: 'DXB',
      departure: '2017-03-21T01:40:00.000+05:30',
      arrival: '2017-03-21T03:35:00.000+04:00',
      airline: '9W',
      flightNumber: '580',
      serviceClass: 'Economy',
      uapi_segment_ref: 'AWw4spBAAA/B74ADtOAAAA==',
      plane: ['73H'],
      duration: ['205'],
      techStops: [],
      status: 'HK',
      bookingClass: 'V'
    }
  ],
};

AirService.getExchangeInformation(params).then(
  data => console.log(data),
  err => console.log(err)
);
