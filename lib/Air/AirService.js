var AirServiceInternal = require('./AirServiceInternal');

module.exports = function(auth, debug) {
    return {
        shop: function(options) {
            var AirService = AirServiceInternal(auth, debug);
            return AirService.searchLowFares(options);
        }
    };
};