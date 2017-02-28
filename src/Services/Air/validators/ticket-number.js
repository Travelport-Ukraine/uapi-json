import { AirValidationError } from '../AirErrors';

export default (params) => {
  if (!params.ticketNumber) {
    throw new AirValidationError.TicketNumberMissing();
  }
  if (!String(params.ticketNumber).match(/^\d{13}/)) {
    throw new AirValidationError.TicketNumberInvalid();
  }
};
