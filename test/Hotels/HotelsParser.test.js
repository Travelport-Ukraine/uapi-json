
const assert = require('assert');
const fs = require('fs');
const Parser = require('../../src/Request/uapi-parser');
const hotelsParser = require('../../src/Services/Hotels/HotelsParser');

const xmlFolder = `${__dirname}/../FakeResponses/Hotels`;

describe('#hotelsParser', () => {
  describe('searchParse()', () => {
    it('give response object', () => {
      // example search request (incomplete)
      const request = {
        location: 'IEV',
      };
      const uParser = new Parser('hotel:HotelSearchAvailabilityRsp', 'v47_0', request);
      const parseFunction = hotelsParser.HOTELS_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/HOTELS_SEARCH_REQUEST.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const hotels = parseFunction.call(uParser, json);
        assert.notEqual(hotels.hotels, undefined, 'Hotels are not defined');
        assert.equal(hotels.hotels.length, 10, 'Not equal length');
        hotels.hotels.forEach((hotel) => {
          assert.notEqual(hotel.HotelCode, undefined, 'No hotel code');
          assert.notEqual(hotel.HotelChain, undefined, 'No hotel chain');
          assert.notEqual(hotel.HotelLocation, undefined, 'No hotel city/location');
          assert.equal(hotel.HotelLocation, 'IEV', 'Hotel location in IATA code from request (missing in reply)');
          assert.notEqual(hotel.VendorLocationKey, undefined, 'No vendorlocation key');
          assert.notEqual(hotel.Name, undefined, 'No name');
          assert.notEqual(hotel.Description, undefined, 'No description');
          assert.notEqual(hotel.HotelRating, undefined, 'No rating for hotel(stars)');
          assert.notEqual(hotel.Location.lat, undefined, 'No location');
          assert.notEqual(hotel.Location.lng, undefined, 'No location');
          assert.equal(hotel.Rates.constructor, Array, 'No rates');
          hotel.Rates.forEach((rate) => {
            assert.notEqual(rate.ApproximateMinimumStayAmount.value, undefined, 'no min sum in rate');
            assert.notEqual(rate.RateSupplier, undefined, 'no rate supplier');
            assert.notEqual(rate.RateSupplierLogo, undefined, 'no rate logo');
            assert.notEqual(rate.PaymentType, undefined, 'no rate type');
          });
          assert.notEqual(hotel.Address, undefined, 'No address');
          assert.notEqual(hotel.Amenties, undefined, 'No amenties');
        });
        assert.equal({}.hasOwnProperty.call(hotels, 'HostToken'), true, 'No host token');
      });
    });
  });

  describe('rateParse()', () => {
    it('give response object', () => {
      // test object from searchHotels() hotels list
      const request = {
        HotelCode: 'TEST',
        HotelChain: 'Test hotels',
        HotelLocation: 'LON', // or GBLON@
        Name: 'First Premium Test Hotel',
        Rates: [],
        Address: 'test address',
        Amenties: [],
      };
      const uParser = new Parser('hotel:HotelDetailsRsp', 'v47_0', request);
      const parseFunction = hotelsParser.HOTELS_RATE_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/HOTELS_RATE_REQUEST.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        assert.notEqual(result.HostToken, undefined, 'No host token');
        assert.equal(result.Comments.constructor, Array, 'No comments');
        result.Comments.forEach((comment) => {
          assert.notEqual(comment.text, undefined, 'No comment text');
          assert.notEqual(comment.date, undefined, 'No comment date');
          assert.notEqual(comment.language, undefined, 'No comment language');
          assert.notEqual(comment.id, undefined, 'No comment id');
        });
        result.Agregators.forEach((rates) => {
          assert.notEqual(rates.media, undefined, 'Images are not defined');
          assert.notEqual(rates.hotel.HotelCode, undefined, 'No hotel code');
          assert.notEqual(rates.hotel.HotelChain, undefined, 'No hotel chain');
          assert.notEqual(rates.hotel.HotelLocation, undefined, 'No hotel city/location');
          assert.equal(rates.hotel.HotelLocation, 'GBLON@', 'Hotel location in TRM code from XML');
          assert.notEqual(rates.hotel.Name, undefined, 'No name');
          assert.notEqual(rates.hotel.Address, undefined, 'No address');
          assert.equal(rates.DetailItem.constructor, Object, 'No details');
          assert.equal(rates.RateDetail.constructor, Array, 'No rates');
          rates.RateDetail.forEach((rate) => {
            assert.notEqual(rate.RatePlanType, undefined, 'No RatePlanType');
            assert.notEqual(rate.Base.value, undefined, 'No Base');
            assert.notEqual(rate.Tax.value, undefined, 'No Tax');
            assert.notEqual(rate.Total.value, undefined, 'No Total');
            assert.notEqual(rate.Surcharge.value, undefined, 'No Surcharge');
            assert.notEqual(rate.RateSupplier, undefined, 'No RateSupplier');
            assert.notEqual(rate.RateOfferId, undefined, 'No RateOfferId');
            assert.notEqual(rate.BookableQuantity, undefined, 'No BookableQuantity');
            assert.notEqual(rate.Capacity, undefined, 'No Capacity');
            assert.notEqual(rate.GuaranteeInfo, undefined, 'No GuaranteeInfo');
            assert.notEqual(rate.CancelInfo, undefined, 'No CancelInfo');
            assert.equal(rate.RoomRateDescription.constructor, Object, 'No RoomRateDescription');
            assert.notEqual(rate.RoomRateDescription.SupplierTermsandConditions, undefined, 'No SupplierTermsandConditions in RoomRateDescription');
            assert.notEqual(rate.RoomRateDescription.RateDescription, undefined, 'No RateDescription in RoomRateDescription');
            assert.notEqual(rate.RoomRateDescription.RoomType, undefined, 'No RoomType in RoomRateDescription');
            assert.notEqual(rate.RoomRateDescription.Description, undefined, 'No Description in RoomRateDescription');
            assert.notEqual(rate.RoomRateDescription.CommissionAmount, undefined, 'No Commission Amount in RoomRateDescription');
            assert.notEqual(rate.RoomRateDescription.SupplierTermsandConditions, undefined, 'No Deposit Amount in RoomRateDescription');
          });
        });
      });
    });
  });

  describe('bookParse()', () => {
    it('give response object', () => {
      const uParser = new Parser('universal:HotelCreateReservationRsp', 'v47_0', {});
      const parseFunction = hotelsParser.HOTELS_BOOK_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/HOTELS_BOOK_REQUEST.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        assert.notEqual(result.LocatorCode, undefined, 'No LocatorCode');
        assert.notEqual(result.Status, undefined, 'No Status');

        assert.notEqual(result.ProviderReservationInfo, undefined, 'No ProviderReservationInfo');
        assert.equal(result.ProviderReservationInfo.constructor, Object, 'No ProviderReservationInfo');
        assert.notEqual(result.ProviderReservationInfo.LocatorCode, undefined, 'No LocatorCode in ProviderReservationInfo');
        assert.notEqual(result.ProviderReservationInfo.CreateDate, undefined, 'No CreateDate in ProviderReservationInfo');
        assert.notEqual(result.ProviderReservationInfo.ProviderCode, undefined, 'No ProviderCode in ProviderReservationInfo');

        assert.equal(result.HotelReservation.constructor, Object, 'No ProviderReservationInfo');
        assert.notEqual(result.HotelReservation.Status, undefined, 'No Status in HotelReservation');
        assert.notEqual(result.HotelReservation.AggregatorBookingStatus, undefined, 'No LocatorCode in HotelReservation');
        assert.notEqual(result.HotelReservation.LocatorCode, undefined, 'No LocatorCode in HotelReservation');
        assert.notEqual(result.HotelReservation.CreateDate, undefined, 'No CreateDate in HotelReservation');
        assert.notEqual(result.HotelReservation.BookingConfirmation, undefined, 'No BookingConfirmation in HotelReservation');
      });
    });
  });

  describe('cancelBookParse()', () => {
    it('give response object', () => {
      const uParser = new Parser('universal:UniversalRecordCancelRsp', 'v47_0', {});
      const parseFunction = hotelsParser.HOTELS_CANCEL_BOOK_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/HOTELS_CANCEL_BOOK_REQUEST.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        assert.notEqual(result.Cancelled, undefined, 'No Cancelled');
        assert.notEqual(result.CreateDate, undefined, 'No CreateDate');
      });
    });
  });
});
