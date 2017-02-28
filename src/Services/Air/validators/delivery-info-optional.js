import { AirValidationError } from '../AirErrors';
import hasAllFields from '../../../utils/has-all-required-fields';

export default (params) => {
  if (params.deliveryInformation) {
    const requiredFields = ['name', 'street', 'zip', 'country', 'city'];
    hasAllFields(
      params.deliveryInformation,
      requiredFields,
      AirValidationError.DeliveryInformation
    );
  }
};

