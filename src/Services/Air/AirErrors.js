import {
  createErrorClass,
  createErrorsList,
} from 'node-errors-helpers';
import errorTypes from '../../error-types';

// Validation errors
export const AirValidationError = createErrorClass(
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
  AirPricingSolutionInvalidType: 'air:AirPricingSolution array is expected',
  BirthDateInvalid: 'Invalid birth date',
  FopMissing: 'Form of payment missing',
  FopTypeUnsupported: 'Form of payment type is unsupported',
}, AirValidationError));

export const GdsValidationError = createErrorClass(
  'GdsValidationError',
  'Gds service validation error',
  errorTypes.ValidationError
);
Object.assign(GdsValidationError, createErrorsList({
  PnrMissing: 'PNR is missing in request',
  QueueMissing: 'Queue is missing in request',
  PccMissing: 'Pcc is missing in request',
}, GdsValidationError));

export const AirFlightInfoValidationError = createErrorClass(
  'AirFlightInfoValidationError',
  'Air FlightInfo service validation error',
  errorTypes.ValidationError
);
Object.assign(AirFlightInfoValidationError, createErrorsList({
  AirlineMissing: 'Airline is missing in request',
  FlightNumberMissing: 'Flight number is missing in request',
  DepartureMissing: 'Departure is missing in request',
}, AirFlightInfoValidationError));

// Parsing errors
export const AirParsingError = createErrorClass(
  'AirParsingError',
  'Air service parsing error',
  errorTypes.ParsingError
);
Object.assign(AirParsingError, createErrorsList({
  ResponseDataMissing: 'One of main data arrays is missing in parsed XML response',
  ReservationsMissing: 'Reservations missing in response',
  BookingInfoError: 'air:BookingInfo should be an array',
  PlatingCarriersError: 'Plating carriers do not coincide across all passenger reservations',
  PTCIsNotSet: 'Code is not set for PassengerTypeCode item',
  PTCTypeInvalid: 'PassengerTypeCode is supposed to be a string or array of PassengerTypeCode items',
  HistogramTypeInvalid: 'PassengerType is supposed to be an array',
  MultiplePricingSolutionsNotAllowed: 'Expected only one pricing solution, need to clarify search?',
  PricingSolutionNotFound: 'Pricing solution not found',
  ReservationProviderInfoMissing: 'Can\'t find provider information about reservation',
}, AirParsingError));

// Runtime errors
export const AirRuntimeError = createErrorClass(
  'AirRuntimeError',
  'Air service runtime error',
  errorTypes.RuntimeError
);
Object.assign(AirRuntimeError, createErrorsList({
  SegmentBookingFailed: 'Failed to book on or more segments',
  TicketingFailed: 'Ticketing failed',
  TicketingFoidRequired: 'FOID required for the PC selected',
  TicketingResponseMissing: 'Response message text doesn\'t contain OK:Ticket issued',
  TicketingTicketsMissing: 'Tickets not found in ticketing response',
  NoResultsFound: 'No results found',
  NoValidFare: 'No valid fare for input criteria.',
  TravelersListError: 'Not all BookingTravelers present in list or wrong lookup keys provided',
}, AirRuntimeError));

export const AirFlightInfoRuntimeError = createErrorClass(
  'AirFlightInfoRuntimeError',
  'Air flight info service runtime error',
  errorTypes.RuntimeError
);
Object.assign(AirFlightInfoRuntimeError, createErrorsList({
  FlightNotFound: 'Flight not found',
  AirlineNotSupported: 'Airline not supported',
  InvalidFlightNumber: 'Invalid flight number',
}, AirFlightInfoRuntimeError));

export const GdsRuntimeError = createErrorClass(
  'GdsRuntimeError',
  'Gds service runtime error',
  errorTypes.RuntimeError
);
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
