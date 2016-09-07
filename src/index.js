const hotelsService = require('./Hotels/HotelsService');
const airService = require('./Air/AirService');
const utilsService = require('./Utils/UtilsService');

const uAPI = {
  createUtilsService(settings) {
    return utilsService(settings);
  },

  createHotelService(settings) {
    return hotelsService(settings);
  },

  createAirService(settings) {
    return airService(settings);
  },

  createUniversalService(settings) {
    return airService(settings); // TODO: move
  },
};

module.exports = uAPI;
