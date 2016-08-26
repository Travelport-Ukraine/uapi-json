var uError = require('../errors');


module.exports = function(err) {
    try {
        var errno = err[0].detail[0]['common_v34_0:ErrorInfo'][0]['common_v34_0:Code'][0];
    } catch(e) {
        var errno = 0;
    }
    switch(errno*1){
        case 4965:
            throw new uError('EMPTY_RESULTS', err);
            break;
        case 5000:
            throw new uError('NO_CITY_RESULTS', err);
            break;
        case 5574:
            throw new uError('NO_ENGINES_RESULTS', err);
            break;
        default:
            throw new uError('UNHANDLED_ERROR', err);
    }
};
