import {
  createErrorClass,
  createErrorsList,
} from 'node-errors-helpers';
import errorTypes from '../../error-types';

// Validation errors
const AirValidationError = createErrorClass(
  'AirValidationError',
  'Air service validation error',
  errorTypes.ValidationError
);
Object.assign(AirValidationError, createErrorsList({
  PassengersHashMissing: 'Passengers hash of passenger types is missing',
  PassengersCategoryInvalid: 'Passengers hash contains invalid passenger',
  PassengersCountInvalid: 'Passengers category has wrong passegners number',
  LegsMissing: 'Missing legs in request',
  LegsInvalidType: 'Invalid type for legs in request',
  LegsInvalidStructure: 'Leg in leg array foes not all required fields',
}, AirValidationError));
const GdsValidationError = createErrorClass(
  'GdsValidationError',
  'Gds service validation error',
  errorTypes.ValidationError
);
Object.assign(GdsValidationError, createErrorsList({
  PnrMissing: 'PNR is missing in request',
  QueueMissing: 'Queue is missing in request',
  PccMissing: 'Pcc is missing in request',
}, GdsValidationError));
const AirFlightInfoValidationError = createErrorClass(
  'AirFlightInfoValidationError',
  'Air FlightInfo service validation error',
  errorTypes.ValidationError
);
Object.assign(AirFlightInfoValidationError, createErrorsList({
  AirlineMissing: 'Airline is missing in request',
  FlightNumberMissing: 'Flight number is missing in request',
  DepartureMissing: 'Departure is missing in request',
  KeyMissing: 'Key is missing in request',
}, AirFlightInfoValidationError));

// Parsing errors
const AirParsingError = createErrorClass(
  'AirParsingError',
  'Air service parsing error',
  errorTypes.ParsingError
);
Object.assign(AirParsingError, createErrorsList({
  ResponseDataMissing: 'One of main data arrays is missing in parsed XML response',
  TicketingResponseMissing: 'Response message text doesn\'t contain OK:Ticket issued',
  TicketingTicketsMissing: 'Tickets not found in ticketing response',
  ReservationsMissing: 'Reservations missing in response',
}, AirParsingError));

// Runtime errors
const AirRuntimeError = createErrorClass(
  'AirRuntimeError',
  'Air service runtime error',
  errorTypes.RuntimeError
);
const AirFlightInfoRuntimeError = createErrorClass(
  'AirFlightInfoRuntimeError',
  'Air flight info service runtime error',
  errorTypes.RuntimeError
);
const GdsRuntimeError = createErrorClass(
  'GdsRuntimeError',
  'Gds service runtime error',
  errorTypes.RuntimeError
);
Object.assign(AirRuntimeError, createErrorsList({
  SegmentBookingFailed: 'Failed to book on or more segments',
  TicketingFailed: 'Ticketing failed',
  TicketingFoidRequired: 'FOID required for the PC selected',
  NoResultsFound: 'No results found',
  NoValidFare: 'No valid fare for input criteria.',
  TravelersListError: 'Not all BookingTravelers present in list or wrong lookup keys provided',
}, AirRuntimeError));
Object.assign(AirFlightInfoRuntimeError, createErrorsList({
  FlightNotFound: 'Flight not found',
  AirlineNotSupported: 'Airline not supported',
  InvalidFlightNumber: 'Invalid flight number',
}, AirRuntimeError));
Object.assign(GdsRuntimeError, createErrorsList({
  PlacingInQueueMessageMissing: 'Placing success message missing',
  PlacingInQueueError: 'Error during placing in queue request',
}, GdsRuntimeError));

export default {
  AirValidationError,
  AirFlightInfoValidationError,
  GdsValidationError,
  AirParsingError,
  AirFlightInfoRuntimeError,
  AirRuntimeError,
  GdsRuntimeError,
};
