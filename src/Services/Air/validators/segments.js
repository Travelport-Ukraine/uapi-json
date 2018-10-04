const { AirValidationError } = require('../AirErrors');
const hasAllFields = require('../../../utils/has-all-required-fields');

module.exports = (params) => {
  if (params.segments) {
    if (Object.prototype.toString.call(params.segments) !== '[object Array]') {
      throw new AirValidationError.SegmentsMissing(params.segments);
    }

    params.segments.forEach((segment) => {
      const requiredFields = [
        'arrival',
        'departure',
        'airline',
        'from',
        'to',
        'flightNumber',
        'plane',
      ];
      hasAllFields(
        segment,
        requiredFields,
        AirValidationError.SegmentsMissing
      );
    });
  }
};
