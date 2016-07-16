var uError = require('../errors');


module.exports = function(err) {
    try {
        var errno = err['SOAP:Fault'][0].detail[0]['common_v34_0:ErrorInfo'][0]['common_v34_0:Code'][0];
    } catch(e) {
        var errno = 0;
    }
    switch(errno*1){
        default:
            throw new uError('UNHANDLED_ERROR', err);
            break;
    }
};
