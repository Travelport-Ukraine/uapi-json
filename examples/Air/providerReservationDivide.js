const uAPI = require('../../index');
const config = require('../../test/testconfig');


const AirService = uAPI.createAirService({
  auth: config,
  debug: 2,
  production: true,
});

const params = {
  uapi_ur_locator: 'WONDER',
  provider: '1G',
  pnr: 'ALICE1',
  passengers: [
    {
      uapi_passenger_ref: 'Where+Is+The+Rabbit+Hole=='
    },
  ]
};

AirService.providerReservationDivide(params)
  .then(
    data => console.log(data),
    err => console.log(err)
  );
