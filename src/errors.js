const allErrors = {
  // GENERAL ERRORS
  UNDEFINED_SERVICE_URL: { errno: 2, msg: 'Service URL not provided.' },
  UNDEFINED_AUTH_DATA: { errno: 3, msg: 'Auth data is not defined.' },
  EMPTY_PARAMS: { errno: 5, msg: 'Empty params for function were provided.' },
  SOAP_ERROR: { errno: 6, msg: 'Error has occurred in SOAP call.' },
  UNDEFINED_REQUEST_TYPE: { errno: 7, msg: 'Undefined request type.' },
  NO_TEMPLATE_FILE: { errno: 8, msg: 'XML template not found.' },
  SOAP_REQUEST_ERROR: { errno: 9, msg: 'Error during request to SOAP API. Check url validity.' },
  SOAP_REQUEST_TIMEOUT: { errno: 10, msg: 'SOAP response timeout.' },
  PARSING_ERROR: { errno: 11, msg: 'Error during request.' },
  UNHANDLED_ERROR: { errno: 12, msg: 'Error during request. Please try your request later.' },
  EMPTY_RESULTS: { errno: 13, msg: 'No results for current request.' },
  NO_ENGINES_RESULTS: { errno: 14, msg: 'None of the enabled engines could fulfill your request.' },
  NO_CITY_RESULTS: { errno: 15, msg: 'Cant find hotels for curreny city.' },
  GENERAL_ERROR: { errno: 16, msg: 'General hotel service error' },

  // HOTELS VALIDATION ERRORS
  VALIDATION_LOCATION: { errno: 101, msg: 'Missing location in request.' },
  VALIDATION_START_DATE: { errno: 102, msg: 'Missing startDate in request.' },
  VALIDATION_END_DATE: { errno: 103, msg: 'Missing endDate in request.' },
  VALIDATION_ADULTS: { errno: 104, msg: 'Missing adults in request.' },
  VALIDATION_ROOMS: { errno: 105, msg: 'Missing rooms in request.' },
  VALIDATION_CHILDREN: { errno: 115, msg: 'Missing children in request.' },
  VALIDATION_CHILDREN_AGE: { errno: 116, msg: 'Need to set correct child age.' },
  VALIDATION_HOTEL_CHAIN: { errno: 106, msg: 'Missing HotelChain in request.' },
  VALIDATION_HOTEL_CODE: { errno: 107, msg: 'Missing HotelCode in request.' },
  VALIDATION_VENDOR_LOCATION_KEY: { errno: 108, msg: 'Missing VendorLocationKey in request.' },
  VALIDATION_LOCATOR_CODE: { errno: 109, msg: 'Missing LocatorCode in request.' },
  // Booking travelere validation
  VALIDATION_PEOPLE: {
    errno: 110,
    msg: 'Missing people is request. Must be more that 1 traveler.',
  },
  VALIDATION_FIRST_NAME: { errno: 111, msg: 'Missing FirstName in request.' },
  VALIDATION_LAST_NAME: { errno: 112, msg: 'Missing LastName in request.' },
  VALIDATION_PREFIX_NAME: { errno: 113, msg: 'Missing PrefixName in request.' },
  VALIDATION_NATIONALITY: { errno: 114, msg: 'Missing Nationality in request.' },
  VALIDATION_BIRTHDATE: { errno: 115, msg: 'Missing BirthDate in request.' },
  VALIDATION_AREA_CODE: { errno: 116, msg: 'Missing AreaCode in request.' },
  VALIDATION_COUNTRY_CODE: { errno: 117, msg: 'Missing CountryCode in request.' },
  VALIDATION_PHONE_NUMBER: { errno: 118, msg: 'Missing Number in request.' },
  VALIDATION_EMAIL: { errno: 119, msg: 'Missing Email in request.' },
  VALIDATION_COUNTRY: { errno: 120, msg: 'Missing Country in request.' },
  VALIDATION_CITY: { errno: 121, msg: 'Missing City in request.' },
  VALIDATION_STREET: { errno: 122, msg: 'Missing Street in request.' },
  VALIDATION_POSTAL_CODE: { errno: 123, msg: 'Missing PostalCode in request.' },
  // Guarantee validation
  VALIDATION_GUARANTEE: { errno: 124, msg: 'Missing Guarantee.' },
  VALIDATION_CVV: { errno: 125, msg: 'Missing CVV.' },
  VALIDATION_EXPDATE: { errno: 126, msg: 'Missing ExpDate.' },
  VALIDATION_CARDNUMBER: { errno: 127, msg: 'Missing CardNumber.' },
  VALIDATION_CARDTYPE: { errno: 128, msg: 'Missing CardType.' },
  VALIDATION_CARDHOLDER: { errno: 129, msg: 'Missing CardHolder.' },
  VALIDATION_RATES: { errno: 130, msg: 'Missing rates' },
  VALIDATION_TOTAL: { errno: 131, msg: 'Missing Total price.' },
  VALIDATION_SURCHARGE: { errno: 132, msg: 'Missing Surcharge.' },
  VALIDATION_TAX: { errno: 133, msg: 'Missing Tax.' },
  VALIDATION_BASE: { errno: 134, msg: 'Missing Base price.' },
  VALIDATION_RATESUPPLIER: { errno: 135, msg: 'Missing RateSupplier.' },
  VALIDATION_RATEPLANTYPE: { errno: 136, msg: 'Missing RatePlanType.' },
  VALIDATION_RATEOFFERID: { errno: 137, msg: 'Missing RateOfferId.' },

  VALIDATION_HOSTTOKEN: { errno: 140, msg: 'Missing HostToken.' },

  MISSING_CURRENCIES: { errno: 141, msg: 'Missing currencies.' },
  // HOTELS PARSING ERRORS
  PARSING_HOTELS_SEARCH_ERROR: {
    errno: 151,
    msg: 'Cant parse XML repsonse. #HotelsParser.searchParse()',
  },
  PARSING_HOTELS_MEDIA_ERROR: {
    errno: 152,
    msg: 'Cant parse XML repsonse. #HotelsParser.kediaParse()',
  },
  PARSING_HOTELS_RATES_ERROR: {
    errno: 153,
    msg: 'Cant parse XML repsonse. #HotelsParser.rateParse()',
  },
  PARSING_HOTELS_BOOKING_ERROR: {
    errno: 154,
    msg: 'Cant parse XML repsonse. #HotelsParser.bookParse()',
  },
  PARSING_HOTELS_CANCEL_BOOKING_ERROR: {
    errno: 155,
    msg: 'Cant parse XML repsonse. #HotelsParser.cancelBookParse()',
  },

  // AIR validation
  PASSENGERS_REQUIRED_LOW: {
    errno: 1000,
    msg: 'Passengers hash of passenger types is required for #Air.searchLowFares()',
  },
  PASSENGERS_CATEGORY_INVALID: {
    errno: 1001,
    msg: 'Passengers hash includes an invalid passenger category'
    + ' or requested quantity is not a number in #Air.searchLowFares()',
  },
  LEGS_REQUIRED: {
    errno: 1002,
    msg: 'Legs should be an array in request for #Air.searchLowFares()',
  },
  LEGS_REQUIRED_STRUCTURE: {
    errno: 1003,
    msg: 'Leg in leg array does not have all required fields for #Air.searchLowFares()',
  },
  SMART_SEARCH_UNKNOWN_TASK: { errno: 1100, msg: 'Unknown task type for AirService.smartSearch()' },
  PARSING_AIR_NO_REPLY: {
    errno: 1200,
    msg: 'No air:LowFareSearchRsp object in parsed XML for #Air.searchLowFares()',
  },
  PARSING_AIR_KEYING_ERROR: {
    errno: 1201,
    msg: 'Exception at mapping keys in air:LowFareSearchRsp',
  },
  PARSING_AIR_WRONG_TYPE: {
    errno: 1202,
    msg: 'One of main data arrays is missing in parsed XML response for #Air.searchLowFares()',
  },
  PARSING_AIR_TICKET_NO_RESPONSE_MESSAGE: {
    errno: 1203,
    msg: "Response message text doesn't contain OK:Ticket issued",
  },
  PARSING_AIR_TICKET_NO_TICKETS: { errno: 1204, msg: 'Tickets not found in ticketing response.' },

  PARSING_AIR_IMPORT_NO_REPLY: {
    errno: 1400,
    msg: 'No universal:UniversalRecordImportRsp object in parsed XML for #Air.import()',
  },
  GDS_PLACE_QUEUE_ERROR: { errno: 1500, msg: 'Error during place queue request' },
};


module.exports = function (type, details = '') {
  let error = null;
  if (details) {
    error = new Error(allErrors[type].msg + ' Details provided.');
    error.msg = allErrors[type].msg + ' Details provided.';

    if (details.msg && typeof (details.msg) === 'string') {
      error.msg += ' Vendor message: ' + details.msg;
    }
  } else {
    error = new Error(allErrors[type].msg);
    error.msg = allErrors[type].msg;
  }
  error.errno = allErrors[type].errno;
  error.details = details;
  return error;
};
