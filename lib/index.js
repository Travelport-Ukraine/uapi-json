var HotelsService = require('./Hotels/HotelsService');
var AirService = require('./Air/AirService');
var UtilsService = require('./Utils/UtilsService');

var uAPI = {
    createUtilsService: function(settings) {
        return UtilsService(settings);
    },

    createHotelService: function(settings) {
        return HotelsService(settings);
    },

    createAirService: function(settings) {
        return AirService(settings);
    },

    createUniversalService: function(settings) {
        return AirService(settings); //TODO: move
    }
};

module.exports = uAPI;
