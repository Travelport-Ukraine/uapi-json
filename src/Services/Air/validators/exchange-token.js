import { AirValidationError } from '../AirErrors';

export default (params) => {
  if (params.exchangeToken === undefined
    || params.exchangeToken === null) {
    throw new AirValidationError.ExchangeToken(params);
  }
};
