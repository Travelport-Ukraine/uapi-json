const { AirValidationError } = require('../AirErrors');
const hasAllFields = require('../../../utils/has-all-required-fields');

module.exports = (params) => {
  if (params.deliveryInformation) {
    const requiredFields = ['name', 'street', 'zip', 'country', 'city'];
    hasAllFields(
      params.deliveryInformation,
      requiredFields,
      AirValidationError.DeliveryInformation
    );
  }
};
