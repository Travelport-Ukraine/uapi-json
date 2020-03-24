const uAPI = require('../../index');
const config = require('../../test/testconfig');
const uuid = require('uuid');

const UtilService = uAPI.createUtilsService( {
    auth: config,
    debug: 2,
    production: false,
  }
);

const params = {
    dataType: "HotelAmenities",
    TraceId: uuid()
};

UtilService.referenceData(params)
.then(
  res => console.log(res),
  err => console.log(err)
);

