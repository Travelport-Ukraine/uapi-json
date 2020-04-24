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
  pnr: 'PNR000',
  version: 5,
  universalRecordLocatorCode: 'URLC00',
  reservationLocatorCode: 'RLC00',
  bookingTravelerRef: 'BTREF',
  segments: [{
    from: 'WAW',
    to: 'KBP',
    group: 1,
    departure: '2020-12-22T11:30:00.000+01:00',
    arrival: '2020-12-22T14:05:00.000+02:00',
    airline: 'LO',
    flightNumber: '751',
    serviceClass: 'Economy',
    plane: '738',
    bookingClass: 'Y',
  }],
};

AirService.availability(params)
  .then(
    res => console.log(res),
    err => console.log(err)
  );
