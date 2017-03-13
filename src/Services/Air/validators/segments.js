import { AirValidationError } from '../AirErrors';
import hasAllFields from '../../../utils/has-all-required-fields';

export default (params) => {
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
