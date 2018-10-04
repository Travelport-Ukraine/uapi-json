const { AirValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (params.fop === undefined) {
    throw new AirValidationError.FopMissing();
  }

  if (
    Object.prototype.toString.call(params.fop) !== '[object Object]'
    || (
      params.fop.type !== 'Cash'
      && params.fop.type !== 'Card'
    )
  ) {
    throw new AirValidationError.FopTypeUnsupported();
  }
};
