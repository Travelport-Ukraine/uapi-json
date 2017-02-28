import { GdsValidationError } from '../AirErrors';

export default (params) => {
  if (params.pnr === undefined) {
    throw new GdsValidationError.PnrMissing(params);
  }
};
