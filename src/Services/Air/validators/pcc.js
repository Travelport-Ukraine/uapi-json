import { GdsValidationError } from '../AirErrors';

export default (params) => {
  if (params.pcc === undefined) {
    throw new GdsValidationError.PccMissing(this.params);
  }
};
