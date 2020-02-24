const { AirValidationError } = require('../AirErrors');
const hasAllFields = require('../../../utils/has-all-required-fields');

module.exports = (params) => {
  if (params) {
    if (Object.prototype.toString.call(params) !== '[object Object]') {
      throw new AirValidationError.FareRuleMissing(params);
    }

    const requiredFields = [
      'fareRuleKey',
      'ProviderCode',
      'FareInfoRef',
    ];
    hasAllFields(
      params,
      requiredFields,
      AirValidationError.FareRuleMissing
    );
  }
};
