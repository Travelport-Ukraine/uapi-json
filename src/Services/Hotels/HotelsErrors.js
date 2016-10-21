const UError = require('../../errors');

module.exports = function (err) {
  let errno = 0;
  try {
    errno = err[0].detail[0]['common_v34_0:ErrorInfo'][0]['common_v34_0:Code'][0];
  } catch (e) {
    console.log('Error not parsed');
  }
  switch (errno * 1) {
    case 4965:
      throw new UError('EMPTY_RESULTS', err);
    case 5000:
      throw new UError('GENERAL_ERROR', err);
    case 5574:
      throw new UError('NO_ENGINES_RESULTS', err);
    default:
      throw new UError('UNHANDLED_ERROR', err);
  }
};
