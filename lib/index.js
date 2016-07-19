var HotelsService = require('./Hotels/HotelsService');
var AirService = require('./Air/AirService');
var UtilsService = require('./Utils/UtilsService');

var uAPI = {
    createUtilsService: function(auth, debug, production) {
        return UtilsService(auth, debug, production);
    },

    createHotelService: function(auth, debug, production) {
        return HotelsService(auth, debug, production);
    },

    createAirService: function(auth, debug, production) {
        return AirService(auth, debug, production);
    },

    createUniversalService: function(auth, debug) {
        return AirService(auth, debug); //TODO: move
    }
};

module.exports = uAPI;
