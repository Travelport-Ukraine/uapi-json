import { AirValidationError } from '../AirErrors';
import hasAllFields from '../../../utils/has-all-required-fields';

export default (params) => {
  if (params.segments) {
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
      params.segments,
      requiredFields,
      AirValidationError.SegmentsMissing
    );
  }
};
