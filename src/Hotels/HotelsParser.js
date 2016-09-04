const UError = require('../errors');
const amenties = require('./amenties');
const Utils = require('../utils');


const getNextResult = (obj) => {
  const ref = obj['common_v34_0:NextResultReference'];
  return (ref && ref[0] && ref[0]._) || null;
};

const getHostToken = (obj) => {
  const token = obj['common_v34_0:HostToken'];
  return (token && token[0] && token[0]._) || null;
};

const getAmenties = (property) => {
  if (property && property['hotel:Amenities']) {
    return property['hotel:Amenities'][0]['hotel:Amenity'].map(
      (e) => ({ [e.$.Code]: amenties[e.$.Code] })
    );
  }
  return [];
};

const getIcon = (elem) => {
  if (elem && elem['common_v34_0:MediaItem']) {
    return elem['common_v34_0:MediaItem'][0].$.url;
  }
  return null;
};

const getMedia = (rate) => {
  if (rate['common_v34_0:MediaItem']) {
    return rate['common_v34_0:MediaItem']
      .filter(elem => elem.$.type !== 'Gallery')
      .map(elem => elem.$);
  }
  return [];
};

const getComments = (rsp) => {
  if (rsp['hotel:GuestReviews']
    && rsp['hotel:GuestReviews'][0]
    && rsp['hotel:GuestReviews'][0]['hotel:Comments']
  ) {
    return rsp['hotel:GuestReviews'][0]['hotel:Comments'].map(comment =>
      ({
        text: comment._,
        id: comment.$.CommentId,
        date: comment.$.Date,
        language: comment.$.CommenterLanguage,
      })
    );
  }
  return [];
};

const searchParse1G = function (obj) {
  const result = {
    hotels: [],
    nextResult: null,
  };

  if (!obj['hotel:HotelSearchAvailabilityRsp']) {
    throw new UError('PARSING_HOTELS_SEARCH_ERROR', obj);
  }

  const rsp = obj['hotel:HotelSearchAvailabilityRsp'][0];

  result.nextResult = getNextResult(rsp);

  if (rsp['hotel:HotelSearchResult'] && rsp['hotel:HotelSearchResult'][0]) {
    result.hotels = rsp['hotel:HotelSearchResult'].map((elem) => {
      const hotel = {};
      const property = elem['hotel:HotelProperty'][0];

      hotel.Name = Utils.beautifyName(property.$.Name);
      hotel.Address = property['hotel:PropertyAddress'][0]['hotel:Address'][0];
      hotel.HotelCode = property.$.HotelCode;
      hotel.HotelChain = property.$.HotelChain;
      hotel.VendorLocationKey = property.$.VendorLocationKey;
      hotel.Icon = getIcon(elem);
      hotel.Amenties = getAmenties(property);

      hotel.Rates = elem['hotel:RateInfo'].map((rate) =>
        ({
          RateSupplier: '1G',
          PaymentType: 'Post Pay',
          ApproximateMinimumStayAmount: Utils.price(rate.$.MinimumAmount),
        })
      );

      return hotel;
    });
  }

  return result;
};

const searchParse = function (obj) {
  const result = {};

  if (!obj['hotel:HotelSearchAvailabilityRsp']) {
    throw new UError('PARSING_HOTELS_SEARCH_ERROR', obj);
  }

  const rsp = obj['hotel:HotelSearchAvailabilityRsp'][0];
  result.nextResult = getNextResult(rsp);
  result.HostToken = getHostToken(rsp);

  if (rsp['hotel:HotelSearchResult']) {
    if (rsp['hotel:HotelSearchResult'][0]) {
      result.hotels = rsp['hotel:HotelSearchResult'].map((elem) => {
        const hotel = {};
        const property = elem['hotel:HotelProperty'][0];
        hotel.Name = Utils.beautifyName(property.$.Name);
        hotel.Address = property['hotel:PropertyAddress'][0]['hotel:Address'][0];
        hotel.HotelCode = property.$.HotelCode;
        hotel.HotelChain = property.$.HotelChain;
        hotel.VendorLocationKey = property.$.VendorLocationKey;
        hotel.Description = elem['hotel:PropertyDescription'][0]._;
        hotel.Icon = getIcon(elem);
        hotel.HotelRating = property['hotel:HotelRating'][0]['hotel:Rating'] * 1;
        hotel.Rates = elem['hotel:RateInfo'].map((rate) =>
          ({
            RateSupplier: rate.$.RateSupplier,
            RateSupplierLogo: rate.$.RateSupplierLogo,
            PaymentType: rate.$.PaymentType,
            ApproximateMinimumStayAmount: Utils.price(rate.$.ApproximateMinimumStayAmount),
          })
        );
        hotel.Suppliers = hotel.Rates.map(rate => rate.RateSupplier);
        hotel.Amenties = getAmenties(property);
        hotel.Location = {
          lat: property['common_v34_0:CoordinateLocation'][0].$.latitude,
          lng: property['common_v34_0:CoordinateLocation'][0].$.longitude,
        };

        return hotel;
      });
    }
  }
  return result;
};

const rateParse = function (obj) {
  if (!obj['hotel:HotelDetailsRsp']) {
    throw new UError('PARSING_HOTELS_RATES_ERROR', obj);
  }
  const rsp = obj['hotel:HotelDetailsRsp'][0];
  const rateobj = rsp;
  const result = {};

  result.HostToken = getHostToken(rsp);
  result.Comments = getComments(rsp);


  result.Agregators = rateobj['hotel:AggregatorHotelDetails'].map((rate) => {
    const agregator = {
      media: getMedia(rate),
      DetailItem: [],
      RateDetail: [],
    };

    if (rate['hotel:HotelProperty']) {
      agregator.hotel = {};
      const property = rate['hotel:HotelProperty'][0];
      agregator.hotel.HotelCode = property.$.HotelCode;
      agregator.hotel.HotelChain = property.$.HotelChain;
      agregator.hotel.VendorLocationKey = property.$.VendorLocationKey;
      agregator.hotel.Name = Utils.beautifyName(property.$.Name);
      agregator.hotel.Address = property['hotel:PropertyAddress'][0]['hotel:Address'];
    } else {
      throw new UError('PARSING_HOTELS_MEDIA_ERROR');
    }

    if (rate['hotel:HotelDetailItem']) {
      const detailItem = {};

      rate['hotel:HotelDetailItem'].forEach((detail) => {
        if (detail['hotel:Text'].length === 1) {
          detail['hotel:Text'] = detail['hotel:Text'].join('');
        }
        const name = detail.$.Name.split(' ').join('');
        detailItem[name] = detail['hotel:Text'];
      });

      agregator.DetailItem = detailItem;
    }

    if (rate['hotel:HotelRateDetail']) {
      agregator.RateDetail = rate['hotel:HotelRateDetail'].map((detail) => {
        const roomRate = {};

        detail['hotel:RoomRateDescription'].forEach((roomrate) => {
          if (roomrate['hotel:Text'].length === 1) {
            roomrate['hotel:Text'] = roomrate['hotel:Text'].join('');
          }
          const name = roomrate.$.Name.split(' ').join('');
          roomRate[name] = roomrate['hotel:Text'];
        });

        const cancelInfo = (detail['hotel:CancelInfo'] && detail['hotel:CancelInfo'][0]) || null;
        const cancelPolicy = (cancelInfo && cancelInfo['hotel:CancellationPolicy'][0]) || null;
        const guar = (detail['hotel:GuaranteeInfo'] && detail['hotel:GuaranteeInfo'][0]) || null;

        return {
          RatePlanType: detail.$.RatePlanType,
          Base: Utils.price(detail.$.Base),
          Tax: Utils.price(detail.$.Tax),
          Total: Utils.price(detail.$.Total),
          Surcharge: Utils.price(detail.$.Surcharge),
          RateSupplier: detail.$.RateSupplier,
          RateOfferId: detail.$.RateOfferId,
          BookableQuantity: detail.$.BookableQuantity,
          Capacity: detail['hotel:RoomCapacity'][0]['hotel:Capacity'],
          IsPackage: JSON.parse(detail['hotel:RoomCapacity'][0].$.IsPackage),
          CancelInfo: cancelPolicy.replace(/<P>|<B>|<\/P>|<\/B>/g, ''),
          GuaranteeInfo: {
            type: (guar.$)
              ? guar.$.GuaranteeType
              : null,
            amount: (guar['hotel:DepositAmount'])
              ? Utils.price(guar['hotel:DepositAmount'][0].$.Amount)
              : null,
          },
          RoomRateDescription: roomRate,
        };
      });
    }

    return agregator;
  });

  return result;
};

const bookParse = function (obj) {
  const result = {};
  if (!obj['universal:HotelCreateReservationRsp']) {
    throw new UError('PARSING_HOTELS_BOOKING_ERROR', obj);
  }
  const rsp = obj['universal:HotelCreateReservationRsp'][0];
  const msg = rsp['common_v34_0:ResponseMessage'] || [];

  result.ResponseMessages = msg.map(elem =>
    ({
      type: elem.$.Type,
      text: elem._,
    })
  );

  const univrec = rsp['universal:UniversalRecord'][0];

  result.LocatorCode = univrec.$.LocatorCode;
  result.Status = univrec.$.Status;

  result.ProviderReservationInfo = {
    ProviderCode: univrec['universal:ProviderReservationInfo'][0].$.ProviderCode,
    LocatorCode: univrec['universal:ProviderReservationInfo'][0].$.LocatorCode,
    CreateDate: univrec['universal:ProviderReservationInfo'][0].$.CreateDate,
  };

  result.HotelReservation = {
    Status: univrec['hotel:HotelReservation'][0].$.Status,
    AggregatorBookingStatus: univrec['hotel:HotelReservation'][0].$.AggregatorBookingStatus,
    BookingConfirmation: univrec['hotel:HotelReservation'][0].$.BookingConfirmation,
    LocatorCode: univrec['hotel:HotelReservation'][0].$.LocatorCode,
    CreateDate: univrec['hotel:HotelReservation'][0].$.CreateDate,
  };
  return result;
};

const cancelBookParse = function (obj) {
  const result = {};
  if (!obj['universal:UniversalRecordCancelRsp']) {
    throw new UError('PARSING_HOTELS_CANCEL_BOOKING_ERROR', obj);
  }

  const univ = (obj['universal:UniversalRecordCancelRsp']
    && obj['universal:UniversalRecordCancelRsp'][0]) || null;

  const provider = (univ
    && univ['universal:ProviderReservationStatus']
    && univ['universal:ProviderReservationStatus'][0]) || null;

  result.Cancelled = JSON.parse(provider.$.Cancelled);
  result.CreateDate = provider.$.CreateDate;
  result.CancelInfo = provider['universal:CancelInfo'][0]._;
  return result;
};


module.exports = {
  HOTELS_SEARCH_GALILEO_REQUEST: searchParse1G,
  HOTELS_SEARCH_REQUEST: searchParse,
  HOTELS_RATE_REQUEST: rateParse,
  HOTELS_BOOK_REQUEST: bookParse,
  HOTELS_CANCEL_BOOK_REQUEST: cancelBookParse,
};
