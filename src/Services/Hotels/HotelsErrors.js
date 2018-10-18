const {
  createErrorClass,
  createErrorsList,
} = require('node-errors-helpers');
const errorTypes = require('../../error-types');

// Validation errors
const HotelsValidationError = createErrorClass(
  'HotelsValidationError',
  'Hotels service validation error',
  errorTypes.ValidationError
);
const TravellersError = createErrorClass(
  'TravellersError',
  'Travellers information is incorrect',
  HotelsValidationError
);
const ContactError = createErrorClass(
  'AddressError',
  'Address information is incorrect',
  HotelsValidationError
);
const PaymentDataError = createErrorClass(
  'PaymentDataError',
  'Payment information is incorrect',
  HotelsValidationError
);
Object.assign(HotelsValidationError, {
  TravellersError,
  ContactError,
  PaymentDataError,
});
Object.assign(HotelsValidationError, createErrorsList({
  LocationMissing: 'Missing location in request',
  LocationInvalid: 'Invalid location in request',
  StartDateMissing: 'Missing startDate in request',
  StartDateInvalid: 'Invalid startDate in request',
  EndDateMissing: 'Missing endDate in request',
  EndDateInvalid: 'Invalid endDate in request',
  RoomsMissing: 'Missing rooms in request',
  HotelChainMissing: 'Missing HotelChain in request',
  HotelChainInvalid: 'Invalid HotelChain in request',
  HotelCodeMissing: 'Missing HotelCode in request',
  VendorLocationKeyMissing: 'Missing VendorLocationKey in request',
  LocatorCodeMissing: 'Missing LocatorCode in request',
  RatesMissing: 'Missing rates',
  TotalMissing: 'Missing Total price',
  SurchargeMissing: 'Missing Surcharge',
  TaxMissing: 'Missing Tax',
  BasePriceMissing: 'Missing Base price',
  RateSupplierMissing: 'Missing RateSupplier',
  RatePlanTypeMissing: 'Missing RatePlanType',
  RateOfferIdMissing: 'Missing RateOfferId',
  HostTokenMissing: 'Missing HostToken',
}, HotelsValidationError));
Object.assign(TravellersError, createErrorsList({
  AdultsMissing: 'Missing adults in request',
  ChildrenTypeInvalid: 'Invalid type for children in request',
  ChildrenAgeInvalid: 'One or more child in request has invalid age',
  TravellersMissing: 'Missing travellers in request',
  FirstNameMissing: 'Missing FirstName in request',
  LastNameMissing: 'Missing LastName in request',
  PrefixNameMissing: 'Missing PrefixName in request',
  NationalityMissing: 'Missing Nationality in request',
  BirthDateMissing: 'Missing BirthDate in request',
}, TravellersError));
Object.assign(ContactError, createErrorsList({
  AreaCodeMissing: 'Missing AreaCode in request',
  CountryCodeMissing: 'Missing CountryCode in request',
  NumberMissing: 'Missing Number in request',
  EmailMissing: 'Missing Email in request',
  CountryMissing: 'Missing Country in request',
  CountryInvalid: 'Invalid Country in request',
  CityMissing: 'Missing City in request',
  StreetMissing: 'Missing Street in request',
  PostalCodeMissing: 'Missing PostalCode in request',
}, ContactError));
Object.assign(PaymentDataError, createErrorsList({
  GuaranteeMissing: 'Missing Guarantee',
  CvvMissing: 'Missing CVV',
  CvvInvalid: 'Invalid CVV',
  ExpDateMissing: 'Missing ExpDate',
  CardNumberMissing: 'Missing CardNumber',
  CardTypeMissing: 'Missing CardType',
  CardTypeInvalid: 'Invalid CardType',
  CardHolderMissing: 'Missing CardHolder',
}, PaymentDataError));

// Parsing errors
const HotelsParsingError = createErrorClass(
  'HotelsParsingError',
  'Hotels service parsing error',
  errorTypes.ParsingError
);
Object.assign(HotelsParsingError, createErrorsList({
  SearchParsingError: 'Cant parse XML response. #HotelsParser.searchParse()',
  MediaParsingError: 'Cant parse XML response. #HotelsParser.mediaParse()',
  RateParsingError: 'Cant parse XML response. #HotelsParser.rateParse()',
  BookingParsingError: 'Cant parse XML response. #HotelsParser.bookParse()',
  CancelBookingParsingError: 'Cant parse XML response. #HotelsParser.cancelBookParse()',
}, HotelsParsingError));

// Runtime errors
const HotelsRuntimeError = createErrorClass(
  'HotelsRuntimeError',
  'Hotels service runtime error',
  errorTypes.RuntimeError
);
Object.assign(HotelsRuntimeError, createErrorsList({
  NoEnginesResults: 'None of the enabled engines could fulfill your request',
  NoResultsFound: 'No results found',
}, HotelsRuntimeError));

module.exports = {
  HotelsValidationError,
  HotelsParsingError,
  HotelsRuntimeError,
};
