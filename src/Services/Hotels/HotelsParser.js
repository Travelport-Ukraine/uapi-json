const {
  HotelsParsingError,
  HotelsRuntimeError,
} = require('./HotelsErrors');
const {
  RequestRuntimeError,
} = require('../../Request/RequestErrors');

const amenties = require('./amenties');
const Utils = require('../../utils');


const getNextResult = (version, obj) => {
  const ref = obj[`common_${version}:NextResultReference`];
  return (ref && ref._) || null;
};

const getHostToken = (version, obj) => {
  const token = obj[`common_${version}:HostToken`];
  return (token && token._) || null;
};

const getAmenties = (property) => {
  if (property && property['hotel:Amenities']) {
    return property['hotel:Amenities']['hotel:Amenity'].map(e => ({
      [e.Code]: amenties[e.Code],
    }));
  }
  return [];
};

const getIcon = (version, elem) => {
  if (elem && elem[`common_${version}:MediaItem`]) {
    return elem[`common_${version}:MediaItem`].url;
  }
  return null;
};

const getMedia = (version, rate) => {
  if (rate[`common_${version}:MediaItem`]) {
    return rate[`common_${version}:MediaItem`]
      .filter(elem => elem.type !== 'Gallery')
      .map(elem => elem);
  }
  return [];
};

const getComments = (rsp) => {
  if (rsp['hotel:GuestReviews']
    && rsp['hotel:GuestReviews'][0]
    && rsp['hotel:GuestReviews'][0]['hotel:Comments']
  ) {
    return rsp['hotel:GuestReviews'][0]['hotel:Comments'].map(comment => ({
      text: comment._,
      id: comment.$.CommentId,
      date: comment.$.Date,
      language: comment.$.CommenterLanguage,
    }));
  }
  return [];
};

const searchParse = function (rsp) {
  const self = this;
  const result = {};

  result.nextResult = getNextResult(self.uapi_version, rsp);
  result.HostToken = getHostToken(self.uapi_version, rsp);

  if (rsp['hotel:HotelSearchResult']) {
    result.hotels = rsp['hotel:HotelSearchResult'].map((elem) => {
      const hotel = {};
      const property = elem['hotel:HotelProperty'];
      hotel.Name = Utils.beautifyName(property.Name);
      hotel.Address = property['hotel:PropertyAddress']['hotel:Address'];
      hotel.HotelCode = property.HotelCode;
      hotel.HotelChain = property.HotelChain;
      hotel.HotelLocation = property.HotelLocation || self.env.code || self.env.location;
      hotel.VendorLocationKey = property.VendorLocationKey;
      hotel.Description = elem['hotel:PropertyDescription']._;
      hotel.Icon = getIcon(self.uapi_version, elem);
      hotel.HotelRating = property['hotel:HotelRating']['hotel:Rating'] * 1;
      hotel.Rates = elem['hotel:RateInfo'].map(rate => ({
        RateSupplier: rate.RateSupplier,
        RateSupplierLogo: rate.RateSupplierLogo,
        PaymentType: rate.PaymentType,
        ApproximateMinimumStayAmount: Utils.price(rate.ApproximateMinimumStayAmount),
      }));
      hotel.Suppliers = hotel.Rates.map(rate => rate.RateSupplier);
      hotel.Amenties = getAmenties(property);
      hotel.Location = {
        lat: property[`common_${self.uapi_version}:CoordinateLocation`].latitude,
        lng: property[`common_${self.uapi_version}:CoordinateLocation`].longitude,
      };

      return hotel;
    });
  }
  return result;
};

const rateParse = function (rsp) {
  const rateobj = rsp;
  const result = {};
  const self = this;

  result.HostToken = getHostToken(self.uapi_version, rsp);
  result.Comments = getComments(self.uapi_version, rsp);


  result.Agregators = rateobj['hotel:AggregatorHotelDetails'].map((rate) => {
    const agregator = {
      media: getMedia(self.uapi_version, rate),
      DetailItem: [],
      RateDetail: [],
    };

    if (rate['hotel:HotelProperty']) {
      agregator.hotel = {};
      const property = rate['hotel:HotelProperty'];
      agregator.hotel.HotelCode = property.HotelCode;
      agregator.hotel.HotelChain = property.HotelChain;
      agregator.hotel.HotelLocation = property.HotelLocation || self.env.HotelLocation;
      agregator.hotel.VendorLocationKey = property.VendorLocationKey;
      agregator.hotel.Name = Utils.beautifyName(property.Name);
      agregator.hotel.Address = property['hotel:PropertyAddress']['hotel:Address'];
    } else {
      throw new HotelsParsingError.MediaParsingError(rsp);
    }

    if (rate['hotel:HotelDetailItem']) {
      const detailItem = {};

      rate['hotel:HotelDetailItem'].forEach((detail) => {
        if (detail['hotel:Text'].length === 1) {
          detail['hotel:Text'] = detail['hotel:Text'].join('');
        }
        const name = detail.Name.split(' ').join('');
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
          const name = roomrate.Name.split(' ').join('');
          roomRate[name] = roomrate['hotel:Text'];
        });

        const cancelInfo = detail['hotel:CancelInfo'] || null;
        const cancelPolicy = (cancelInfo && cancelInfo['hotel:CancellationPolicy']) || null;
        const guar = detail['hotel:GuaranteeInfo'] || null;

        return {
          RatePlanType: detail.RatePlanType,
          Base: Utils.price(detail.Base),
          Tax: Utils.price(detail.Tax),
          Total: Utils.price(detail.Total),
          Surcharge: Utils.price(detail.Surcharge),
          RateSupplier: detail.RateSupplier,
          RateOfferId: detail.RateOfferId,
          BookableQuantity: detail.BookableQuantity,
          Capacity: detail['hotel:RoomCapacity']['hotel:Capacity'],
          IsPackage: JSON.parse(detail['hotel:RoomCapacity'].IsPackage),
          CancelInfo: cancelPolicy.replace(/<P>|<B>|<\/P>|<\/B>/g, ''),
          GuaranteeInfo: {
            type: (guar && guar.GuaranteeType) || null,
            amount: (guar['hotel:DepositAmount'])
              ? Utils.price(guar['hotel:DepositAmount'].Amount)
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

const bookParse = function (rsp) {
  const result = {};
  const self = this;

  const msg = rsp[`common_${self.uapi_version}:ResponseMessage`] || [];

  result.ResponseMessages = msg.map(elem => ({
    type: elem.Type,
    text: elem._,
  }));

  const univrec = rsp['universal:UniversalRecord'];

  result.LocatorCode = univrec.LocatorCode;
  result.Status = univrec.Status;

  const providerInfoKey = Object.keys(univrec['universal:ProviderReservationInfo']);
  const firstProvider = providerInfoKey[0];
  result.ProviderReservationInfo = {
    ProviderCode: univrec['universal:ProviderReservationInfo'][firstProvider].ProviderCode,
    LocatorCode: univrec['universal:ProviderReservationInfo'][firstProvider].LocatorCode,
    CreateDate: univrec['universal:ProviderReservationInfo'][firstProvider].CreateDate,
  };

  result.HotelReservation = {
    Status: univrec['hotel:HotelReservation'].Status,
    AggregatorBookingStatus: univrec['hotel:HotelReservation'].AggregatorBookingStatus,
    BookingConfirmation: univrec['hotel:HotelReservation'].BookingConfirmation,
    LocatorCode: univrec['hotel:HotelReservation'].LocatorCode,
    CreateDate: univrec['hotel:HotelReservation'].CreateDate,
  };
  return result;
};

const cancelBookParse = function (obj) {
  const result = {};

  const provider = obj['universal:ProviderReservationStatus'] || null;

  result.Cancelled = JSON.parse(provider.Cancelled);
  result.CreateDate = provider.CreateDate;
  result.CancelInfo = provider['universal:CancelInfo']._;
  return result;
};

const errorHandler = function (rsp) {
  let errorInfo;
  let code;
  try {
    errorInfo = rsp.detail[`common_${this.uapi_version}:ErrorInfo`];
    code = errorInfo[`common_${this.uapi_version}:Code`];
  } catch (err) {
    throw new RequestRuntimeError.UnhandledError(null, new HotelsRuntimeError(rsp));
  }
  switch (code) {
    case '4965':
      throw new HotelsRuntimeError.NoResultsFound(rsp);
    case '5574':
      throw new HotelsRuntimeError.NoEnginesResults(rsp);
    case '5000':
    default:
      throw new RequestRuntimeError.UnhandledError(null, new HotelsRuntimeError(rsp));
  }
};

module.exports = {
  HOTELS_ERROR: errorHandler,
  HOTELS_SEARCH_REQUEST: searchParse,
  HOTELS_RATE_REQUEST: rateParse,
  HOTELS_BOOK_REQUEST: bookParse,
  HOTELS_CANCEL_BOOK_REQUEST: cancelBookParse,
};
