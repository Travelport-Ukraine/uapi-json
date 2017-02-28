import { AirValidationError } from '../AirErrors';

export default (params) => {
  if (params.email) {
    if (Object.prototype.toString.call(params.email) !== '[object String]') {
      throw new AirValidationError.IncorrectEmail(params);
    }
  }
};
