const { AirValidationError } = require('../AirErrors');
const hasAllFields = require('../../../utils/has-all-required-fields');

module.exports = (params) => {
  hasAllFields(params, ['phone'], AirValidationError.PhoneMissing);
  const requiredFields = ['number', 'location', 'countryCode'];
  hasAllFields(
    params.phone,
    requiredFields,
    AirValidationError.IncorrectPhoneFormat
  );
};
