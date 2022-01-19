const { AirValidationError } = require('../AirErrors');
const hasAllFields = require('../../../utils/has-all-required-fields');

module.exports = (params) => {
  if (params.seatSegment) {
    if (Object.prototype.toString.call(params.seatSegment) !== '[object Array]') {
      throw new AirValidationError.SegmentsMissing(params.seatSegment);
    }

    params.seatSegment.forEach((segment) => {
      const requiredFields = [
        'arrival',
        'departure',
        'airline',
        'from',
        'to',
        'flightNumber',
        'plane',
        'uapi_segment_ref',
        'group',
      ];
      hasAllFields(
        segment,
        requiredFields,
        AirValidationError.SegmentsMissing
      );
    });
  }
};
