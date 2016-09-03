const HotelsService = require('./Hotels/HotelsService');
const AirService = require('./Air/AirService');
const UtilsService = require('./Utils/UtilsService');

const uAPI = {
  createUtilsService(settings) {
    return UtilsService(settings);
  },

  createHotelService(settings) {
    return HotelsService(settings);
  },

  createAirService(settings) {
    return AirService(settings);
  },

  createUniversalService(settings) {
    return AirService(settings); // TODO: move
  },
};

module.exports = uAPI;
