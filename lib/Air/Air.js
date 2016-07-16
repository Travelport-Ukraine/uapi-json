/**
 * Created by juice on 3/1/16.
 */

var smartSearch = require('./AirSmartSearch');

module.exports = function(auth, debug){
    return {
        smartSearch: smartSearch(auth, debug)
    };
};