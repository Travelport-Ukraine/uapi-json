const uAPI = require('../../index');
const config = require('../../test/testconfig');

const AirService = uAPI.createAirService(
  {
    auth: config,
    debug: 2,
    production: false,
  }
);


const params = {
  segments: [
    {
      "from": "LWO",
      "to": "IST",
      "group": 0,
      "departure": "2017-08-18T18:45:00.000+03:00",
      "arrival": "2017-08-18T20:50:00.000+03:00",
      "airline": "TK",
      "flightNumber": "442",
      "serviceClass": "Economy",
      "plane": [
        "738"
      ],
      "bookingClass": "L",
      "fareBasisCode": "LN2XPB",
    },
    {
      "from": "IST",
      "to": "CGK",
      "group": 0,
      "departure": "2017-08-19T02:10:00.000+03:00",
      "arrival": "2017-08-19T18:00:00.000+07:00",
      "airline": "TK",
      "flightNumber": "56",
      "serviceClass": "Economy",
      "plane": [
        "77W"
      ],
      "bookingClass": "L",
      "fareBasisCode": "LN2XPB",
    },
    {
      "from": "CGK",
      "to": "IST",
      "group": 1,
      "departure": "2017-08-21T20:45:00.000+07:00",
      "arrival": "2017-08-22T04:55:00.000+03:00",
      "airline": "TK",
      "flightNumber": "57",
      "serviceClass": "Economy",
      "plane": [
        "77W"
      ],
      "bookingClass": "E",
      "fareBasisCode": "EN2PX",
    },
    {
      "from": "IST",
      "to": "KBP",
      "group": 1,
      "departure": "2017-08-22T08:00:00.000+03:00",
      "arrival": "2017-08-22T09:55:00.000+03:00",
      "airline": "TK",
      "flightNumber": "457",
      "serviceClass": "Economy",
      "plane": [
        "321"
      ],
      "bookingClass": "E",
      "fareBasisCode": "EN2PX"
    }
  ],
  passengers: {
    ADT: 1,
  },
  long: true,
  requestId: '4e2fd1f8-2221-4b6c-bb6e-cf05c367cf60',
};

AirService.fareRules(params)
  .then(
    (res) => {
      console.log(res);
    },
    err => console.log(err)
  );
