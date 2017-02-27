import { AirValidationError } from '../AirErrors';

export default (params) => {
  if (params.fop === undefined) {
    throw new AirValidationError.FopMissing();
  }

  if (
    Object.prototype.toString.call(params.fop) !== '[object Object]'
    || params.fop.type !== 'Cash'
  ) {
    throw new AirValidationError.FopTypeUnsupported();
  }
};
