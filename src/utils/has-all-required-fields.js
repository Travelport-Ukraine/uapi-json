import errors from '../error-types';

export default (object, fields, ErrorClass = errors.ValidationError) => {
  fields.forEach((field) => {
    if (object[field] === undefined) {
      throw new ErrorClass({
        required: fields,
        missing: field,
      });
    }
  });
};
