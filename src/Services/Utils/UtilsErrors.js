const UError = require('../../errors');


module.exports = (err) => {
  let errno = 0;
  try {
    errno = err['SOAP:Fault'][0].detail[0]['common_v34_0:ErrorInfo'][0]['common_v34_0:Code'][0];
  } catch (e) {
    console.log('cant parse error');
  }

  switch (errno * 1) {
    default:
      throw new UError('UNHANDLED_ERROR', err);
  }
};
