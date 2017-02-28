import { AirValidationError } from '../AirErrors';
import hasAllFields from '../../../utils/has-all-required-fields';

export default (params) => {
  if (params.phone) {
    const requiredFields = ['number', 'location', 'countryCode'];
    hasAllFields(
      params.phone,
      requiredFields,
      AirValidationError.IncorrectPhoneFormat
    );
  }
};
