var uError = require('../errors');


module.exports = function(err) {
    try {
        var errno = err['detail']['common_v34_0:ErrorInfo']['common_v34_0:Code'];
    } catch(e) {
        var errno = 0;
    }
    switch(errno*1){
        case 4965:
            throw new uError('EMPTY_RESULTS', err);

        case 5000:
            throw new uError('NO_CITY_RESULTS', err);

        case 5574:
            throw new uError('NO_ENGINES_RESULTS', err);

        default:
            throw new uError('UNHANDLED_ERROR', err);
    }
};
