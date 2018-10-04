const errors = require('../error-types');

module.exports = (object, fields, ErrorClass = errors.ValidationError) => {
  fields.forEach((field) => {
    if (object[field] === undefined) {
      throw new ErrorClass({
        required: fields,
        missing: field,
      });
    }
  });
};
