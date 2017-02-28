import { AirValidationError } from '../AirErrors';

export default (params) => {
  const solution = params['air:AirPricingSolution'];
  if (Object.prototype.toString.call(solution) !== '[object Object]') {
    throw new AirValidationError.AirPricingSolutionInvalidType(params);
  }
};
