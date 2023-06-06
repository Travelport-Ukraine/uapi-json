const uAPI = require('../../index');
const config = require('../../test/testconfig');

const UtilService = uAPI.createUtilsService({
  auth: config,
  debug: 2,
  production: true,
});

const params = {
  dataType: 'HotelAmenities',
  TraceId: 'some-unique-trace-id',
};

UtilService.referenceData(params)
  .then(
    res => console.log(res),
    err => console.log(err)
  );
