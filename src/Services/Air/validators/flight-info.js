const validateItem = require('./utils/validate-flight-info-item');

module.exports = (params) => {
  if (Array.isArray(params.flightInfoCriteria)) {
    params.flightInfoCriteria.forEach(validateItem);
  } else {
    validateItem(params.flightInfoCriteria);
  }
};
