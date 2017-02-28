import { GdsValidationError } from '../AirErrors';

export default (params) => {
  if (!params.queue) {
    throw new GdsValidationError.QueueMissing(params);
  }
};
