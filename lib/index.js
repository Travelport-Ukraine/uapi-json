var HotelsService = require('./Hotels/HotelsService');
var AirService = require('./Air/AirService');
var UtilsService = require('./Utils/UtilsService');

var uAPI = {
    createUtilsService: function(username, password, targetBranch, debug) {
        debug = debug || false;
        var auth = {
            username: username,
            password: password,
            targetBranch: targetBranch
        }
        return UtilsService(auth, debug * 1);
    },

    createHotelService: function(username, password, targetBranch, debug){
        debug = debug || false;
        var auth = {
            username: username,
            password: password,
            targetBranch: targetBranch
        }
        return HotelsService(auth, debug * 1);
    },

    createAirService: function(auth, debug) {
        return AirService(auth, debug);
    },

    createAirService_by_auth: function(username, password, targetBranch, pcc, debug) {
        var auth = {
            username: username,
            password: password,
            targetBranch: targetBranch,
            pcc: pcc
        }
        return AirService(auth, debug);
    },


    createUniversalService: function(auth, debug) {
        return AirService(auth, debug); //TODO: move
    }


};

module.exports = uAPI;
