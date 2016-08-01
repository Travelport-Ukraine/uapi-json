var AirServiceInternal = require('./AirServiceInternal');

module.exports = function(settings) {
    var auth = settings.auth;
    var debug = settings.debug;
    var production = settings.production;
    return {
        shop: function(options) {
            var AirService = AirServiceInternal(auth, debug, production);
            return AirService.searchLowFares(options);
        }
    };
};
