const createHotelService = require('./Services/Hotels/HotelsService');
const createAirService = require('./Services/Air/AirService');
const createUtilsService = require('./Services/Utils/UtilsService');

const uAPI = {
  createUtilsService,
  createHotelService,
  createAirService,
};

module.exports = uAPI;
