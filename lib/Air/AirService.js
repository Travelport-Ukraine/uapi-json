var AirServiceInternal = require('./AirServiceInternal');

module.exports = function(auth, debug, production) {
    return {
        shop: function(options) {
            var AirService = AirServiceInternal(auth, debug, production);
            return AirService.searchLowFares(options);
        }
    };
};
