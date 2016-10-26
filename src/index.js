const createHotelService = require('./Services/Hotels/HotelsService');
const createAirService = require('./Services/Air/AirService');
const createUtilsService = require('./Services/Utils/UtilsService');
const commonErrors = require('./error-types');
const requestErrors = require('./Request/RequestErrors');
const airErrors = require('./Services/Air/AirErrors');
const hotelsErrors = require('./Services/Hotels/HotelsErrors');
const utilsErrors = require('./Services/Utils/UtilsErrors');

const uAPI = {
  createUtilsService,
  createHotelService,
  createAirService,
  errors: {
    Common: commonErrors,
    Request: requestErrors,
    Air: airErrors,
    Hotels: hotelsErrors,
    Utils: utilsErrors,
  },
};

module.exports = uAPI;
