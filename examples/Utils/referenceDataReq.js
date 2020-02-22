const uAPI = require('../../index');
const config = require('../../test/testconfig');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  

const UtilService = uAPI.createUtilsService( {
    auth: config,
    debug: 2,
    production: false,
  }
);

const params = {
    DataType: "HotelAmenities",
    TraceId: uuidv4()
};

UtilService.referenceDataReq(params)
.then(
  res => console.log(res),
  err => console.log(err)
);

