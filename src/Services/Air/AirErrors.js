const {
  createErrorClass,
  createErrorsList,
} = require('node-errors-helpers');
const errorTypes = require('../../error-types');
const errorCodes = require('../../error-codes');

// Validation errors
const AirValidationError = createErrorClass(
  'AirValidationError',
  ['Air service validation error', errorCodes.Validation],
  errorTypes.ValidationError
);
Object.assign(AirValidationError, createErrorsList({
  ParamsMissing: 'Params are missing',
  ParamsInvalidType: 'Params should be passed as object',
  PassengersHashMissing: 'Passengers hash of passenger types is missing',
  PassengersCategoryInvalid: 'Passengers hash contains invalid passenger',
  PassengersCountInvalid: 'Passengers category has wrong passegners number',
  LegsMissing: 'Missing legs in request',
  LegsInvalidType: 'Invalid type for legs in request',
  LegsInvalidStructure: 'Leg in leg array foes not all required fields',
  AirPricingSolutionInvalidType: 'air:AirPricingSolution array is expected',
  SegmentsMissing: 'Segments missing in request. See data.',
  BirthDateInvalid: 'Invalid birth date',
  FopMissing: 'Form of payment missing',
  FopTypeUnsupported: 'Form of payment type is unsupported',
  TicketNumberMissing: 'Ticket number missing',
  TicketNumberInvalid: 'Ticket number invalid',
  IncorrectEmail: 'Email is in incorrect format',
  PhoneMissing: 'Missing phone in book request',
  IncorrectPhoneFormat: 'Incorrect phone format. Missing required fields. See data.',
  DeliveryInformation: 'Missing of delivery information fields. See data.',
  UniversalRecordLocatorCode: 'Missing UniversalRecordLocatorCode in request. See data.',
  ReservationLocator: 'Missing uapi_reservation_locator/reservationLocatorCode in request. See data.',
  ExchangeToken: 'Missing exchangeToken in request. See data.',
  CreditCardMissing: 'Missing creditCard in request. See data.',
  IncorrectConnectionsFormat: 'Connections should be an array with IATA codes.',
  PlatingCarrierInvalid: 'Plating Carrier Invalid',
  SearchIdMissing: 'SearchId is missing',
  VersionMissing: 'Version is missing in request',
}, AirValidationError));

const GdsValidationError = createErrorClass(
  'GdsValidationError',
  ['Gds service validation error', errorCodes.Validation],
  errorTypes.ValidationError
);
Object.assign(GdsValidationError, createErrorsList({
  PnrMissing: 'PNR is missing in request',
  QueueMissing: 'Queue is missing in request',
  PccMissing: 'Pcc is missing in request',
}, GdsValidationError));

const AirFlightInfoValidationError = createErrorClass(
  'AirFlightInfoValidationError',
  ['Air FlightInfo service validation error', errorCodes.Validation],
  errorTypes.ValidationError
);
Object.assign(AirFlightInfoValidationError, createErrorsList({
  AirlineMissing: 'Airline is missing in request',
  FlightNumberMissing: 'Flight number is missing in request',
  DepartureMissing: 'Departure is missing in request',
}, AirFlightInfoValidationError));

// Parsing errors
const AirParsingError = createErrorClass(
  'AirParsingError',
  'Air service parsing error',
  errorTypes.ParsingError
);
Object.assign(AirParsingError, createErrorsList({
  ResponseDataMissing: 'One of main data arrays is missing in parsed XML response',
  ReservationsMissing: 'Reservations missing in response',
  BookingInfoError: 'air:BookingInfo should be an array',
  PlatingCarriersError: 'Plating carriers do not coincide across all passenger reservations',
  PTCIsNotSet: 'Code not set for PassengerTypeCode item',
  PlatingCarrierNotSet: 'PlatingCarrier is not set for AirPricingInfo item',
  PTCTypeInvalid: 'PassengerTypeCode is supposed to be a string or array of PassengerTypeCode items',
  HistogramTypeInvalid: 'PassengerType is supposed to be an array',
  MultiplePricingSolutionsNotAllowed: 'Expected only one pricing solution, need to clarify search?',
  PricingSolutionNotFound: 'Pricing solution not found',
  ReservationProviderInfoMissing: 'Can\'t find provider information about reservation',
  CancelResponseNotFound: 'Cancel response not found',
  InvalidServiceSegmentFormat: 'Service segment format is invalid',
}, AirParsingError));

// Runtime errors
const AirRuntimeError = createErrorClass(
  'AirRuntimeError',
  ['Air service runtime error', 598],
  errorTypes.RuntimeError
);
Object.assign(AirRuntimeError, createErrorsList({
  SegmentBookingFailed: 'Failed to book on or more segments',
  SegmentWaitlisted: 'One or more segments is waitlisted, not allowed',
  TicketingFailed: 'Ticketing failed',
  TicketingFoidRequired: 'FOID required for the PC selected',
  TicketingPNRBusy: 'The reservation has been modified, unable to ticket now',
  TicketingFOPUnavailable: 'The selected FOP is not available for this carrier',
  TicketingCreditCardRejected: 'Credit card rejected by the airline',
  TicketingResponseMissing: 'Response message text doesn\'t contain OK:Ticket issued',
  TicketingTicketsMissing: 'Tickets not found in ticketing response',
  NoResultsFound: 'No results found',
  InvalidRequestData: 'Request data is invalid',
  NoValidFare: 'No valid fare for input criteria.',
  TravelersListError: 'Not all BookingTravelers present in list or wrong lookup keys provided',
  PnrParseError: 'Failed to parse PNR from ticket information request response',
  GetPnrError: 'Failed to obtain PNR from ticket information',
  UnableToRetrieveTickets: ['Unable to retrieve tickets list', errorCodes.NotFound],
  TicketRetrieveError: 'Unable to retrieve ticket',
  TicketInfoIncomplete: 'Ticket information is incomplete',
  RequestInconsistency: 'Request faced race condition. Please retry again',
  MissingPaxListAndBooking: 'Cant find anything for your request. List and booking are missing',
  TicketCancelResultUnknown: 'Ticket cancel result is unknown',
  FailedToCancelPnr: 'Failed to cancel PNR',
  FailedToCancelTicket: 'Failed to cancel ticket',
  UnableToCancelTicketStatusNotOpen: 'Unable to cancel ticket with status not OPEN',
  PNRHasOpenTickets: 'Selected PNR has tickets. Please use `cancelTickets` option or cancel tickets manually, or use `ignoreTickets` option',
  NoReservationToImport: 'No reservation to import',
  UnableToImportPnr: 'Unable to import requested PNR',
  UnableToOpenPNRInTerminal: 'Unable to open requested PNR in Terminal',
  UnableToAddExtraSegment: 'Unable to add an extra segment to PNR',
  UnableToSaveBookingWithExtraSegment: 'Unable to save booking with extra segment',
  NoResidualValue: 'The original ticket has no residual value for this specific itinerary. Issue a new ticket using current fares.',
  TicketsNotIssued: 'Host error during ticket retrieve.',
  CantDetectExchangeResponse: 'Exchange response is unknown.',
  ExchangeTokenIncorrect: 'Can\'t parse exchange token. Please resolve it again.',
  DuplicateTicketFound: 'Duplicate ticket number found. Provide PNR, UR locator',
  NoPNRFoundInUR: ['No PNR found in Universal record', errorCodes.NotFound],
  NoAgreement: ['There is no agreement between current pcc, and one you try to reach', errorCodes.Validation],
  UnableToRetrieve: ['Unable to retrieve PNR. Please contact your local Travelport Helpdesk.', errorCodes.NotFound],
}, AirRuntimeError));

const AirFlightInfoRuntimeError = createErrorClass(
  'AirFlightInfoRuntimeError',
  ['Air flight info service runtime error', errorCodes.UapiFailure],
  errorTypes.RuntimeError
);
Object.assign(AirFlightInfoRuntimeError, createErrorsList({
  FlightNotFound: 'Flight not found',
  AirlineNotSupported: 'Airline not supported',
  InvalidFlightNumber: 'Invalid flight number',
}, AirFlightInfoRuntimeError));

const GdsRuntimeError = createErrorClass(
  'GdsRuntimeError',
  ['Gds service runtime error', errorCodes.GdsFailure],
  errorTypes.RuntimeError
);
Object.assign(GdsRuntimeError, createErrorsList({
  PlacingInQueueMessageMissing: 'Placing success message missing',
  PlacingInQueueError: 'Error during placing in queue request',
}, GdsRuntimeError));

module.exports = {
  AirValidationError,
  AirFlightInfoValidationError,
  GdsValidationError,
  AirParsingError,
  AirFlightInfoRuntimeError,
  AirRuntimeError,
  GdsRuntimeError,
};
