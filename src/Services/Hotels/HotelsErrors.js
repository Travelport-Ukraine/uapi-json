import {
  createErrorClass,
  createErrorsList,
} from 'node-errors-helpers';
import errorTypes from '../../error-types';

// Validation errors
export const HotelsValidationError = createErrorClass(
  'HotelsValidationError',
  'Hotels service validation error',
  errorTypes.ValidationError
);
const TravellersError = createErrorClass(
  'TravellersError',
  'Travellers information is incorrect',
  HotelsValidationError
);
const AddressError = createErrorClass(
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
  AddressError,
  PaymentDataError,
});
Object.assign(HotelsValidationError, createErrorsList({
  LocationMissing: 'Missing location in request',
  StartDateMissing: 'Missing startDate in request',
  EndDateMissing: 'Missing endDate in request',
  RoomsMissing: 'Missing rooms in request',
  HotelChainMissing: 'Missing HotelChain in request',
  HotelCodeMissing: 'Missing HotelCode in request',
  VendorLocationKeyMissing: 'Missing VendorLocationKey in request',
  LocatorCodeMissing: 'Missing LocatorCode in request',
  RatesMissing: 'Missing rates',
  TotalMissing: 'Missing Total price',
  SurchargeMissing: 'Missing Surcharge',
  TaxMissing: 'Missing Tax',
  BaseMissing: 'Missing Base price',
  RateSupplierMissing: 'Missing RateSupplier',
  RatePlanTypeMissing: 'Missing RatePlanType',
  RateOfferIdMissing: 'Missing RateOfferId',
  HostTokenMissing: 'Missing HostToken',
}, HotelsValidationError));
Object.assign(TravellersError, createErrorsList({
  AdultsMissing: 'Missing adults in request',
  ChildrenMissing: 'Missing children in request',
  ChildrenAgeInvalid: 'Need to set correct child age',
  TravellersMissing: 'Missing travellers in request',
  FirstNameMissing: 'Missing FirstName in request',
  LastNameMissing: 'Missing LastName in request',
  PrefixNameMissing: 'Missing PrefixName in request',
  NationalityMissing: 'Missing Nationality in request',
  BirthDateMissing: 'Missing BirthDate in request',
  AreaCodeMissing: 'Missing AreaCode in request',
  CountryCodeMissing: 'Missing CountryCode in request',
  NumberMissing: 'Missing Number in request',
  EmailMissing: 'Missing Email in request',
}, TravellersError));
Object.assign(AddressError, createErrorsList({
  CountryMissing: 'Missing Country in request',
  CityMissing: 'Missing City in request',
  StreetMissing: 'Missing Street in request',
  PostalCodeMissing: 'Missing PostalCode in request',
}, AddressError));
Object.assign(PaymentDataError, createErrorsList({
  GuaranteeMissing: 'Missing Guarantee',
  CvvMissing: 'Missing CVV',
  ExpDateMissing: 'Missing ExpDate',
  CardNumberMissing: 'Missing CardNumber',
  CardTypeMissing: 'Missing CardType',
  CardHolderMissing: 'Missing CardHolder',
}, PaymentDataError));

// Parsing errors
export const HotelsParsingError = createErrorClass(
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
export const HotelsRuntimeError = createErrorClass(
  'HotelsRuntimeError',
  'Hotels service runtime error',
  errorTypes.RuntimeError
);
Object.assign(HotelsRuntimeError, createErrorsList({
  NoEnginesResults: 'None of the enabled engines could fulfill your request',
  NoResultsFound: 'No results found',
}, HotelsRuntimeError));

export default {
  HotelsValidationError,
  HotelsParsingError,
  HotelsRuntimeError,
};

