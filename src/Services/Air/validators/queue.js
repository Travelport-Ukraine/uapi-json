const { GdsValidationError } = require('../AirErrors');

module.exports = (params) => {
  if (!params.queue) {
    throw new GdsValidationError.QueueMissing(params);
  }
};
