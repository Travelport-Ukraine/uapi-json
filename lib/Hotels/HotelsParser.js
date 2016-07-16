var uError = require('../errors');
var amenties = require('./amenties');
var fs = require('fs');
var Utils = require('../utils');

var searchParse1G = function(obj) {
    var result = {};
    if (!obj['hotel:HotelSearchAvailabilityRsp']){
        throw new uError('PARSING_HOTELS_SEARCH_ERROR', obj);
    }

    var rsp = obj['hotel:HotelSearchAvailabilityRsp'][0];
    if (rsp['common_v34_0:NextResultReference']) {
        if (rsp['common_v34_0:NextResultReference'][0]) {
            if(rsp['common_v34_0:NextResultReference'][0]['_']) {
                result.nextResult = rsp['common_v34_0:NextResultReference'][0]['_'];
            } else {
                result.nextResult = null;
            }
        } else {
            result.nextResult = null;
        }
    } else {
        result.nextResult = null;
    }

    if (rsp['hotel:HotelSearchResult']){
        if (rsp['hotel:HotelSearchResult'][0]){
            result.hotels = rsp['hotel:HotelSearchResult'].map(function(elem) {
                var hotel = {};
                hotel.Name = Utils.beautifyName(elem['hotel:HotelProperty'][0]['$']['Name']);
                hotel.Address = elem['hotel:HotelProperty'][0]['hotel:PropertyAddress'][0]['hotel:Address'][0];
                hotel.HotelCode = elem['hotel:HotelProperty'][0]['$']['HotelCode'];
                hotel.HotelChain = elem['hotel:HotelProperty'][0]['$']['HotelChain'];
                hotel.VendorLocationKey = elem['hotel:HotelProperty'][0]['$']['VendorLocationKey'];
                if (elem['common_v34_0:MediaItem']){
                    hotel.Icon = elem['common_v34_0:MediaItem'][0]['$']['url'];
                }else{
                    hotel.Icon = null;
                }
                hotel.Rates = elem['hotel:RateInfo'].map(function(rate) {
                    return {
                        RateSupplier: '1G',
                        PaymentType: 'Post Pay',
                        ApproximateMinimumStayAmount: Utils.price(rate['$']['MinimumAmount']),
                    }
                });

                if (elem['hotel:HotelProperty'][0]['hotel:Amenities']){
                    hotel.Amenties = elem['hotel:HotelProperty'][0]['hotel:Amenities'][0]['hotel:Amenity'].map(function(e) {
                        var amen = {}
                        amen[e['$']['Code']] = amenties[e['$']['Code']];
                        return amen;
                    });
                }else{
                    hotel.Amenties = [];
                }
                return hotel;
            });
        }
    }

    return result;
};

var searchParse = function(obj){
    var result = {};
    if (!obj['hotel:HotelSearchAvailabilityRsp']){
        throw new uError('PARSING_HOTELS_SEARCH_ERROR', obj);
    }

    var rsp = obj['hotel:HotelSearchAvailabilityRsp'][0];
    if (rsp['common_v34_0:NextResultReference']) {
        if (rsp['common_v34_0:NextResultReference'][0]) {
            if(rsp['common_v34_0:NextResultReference'][0]['_']) {
                result.nextResult = rsp['common_v34_0:NextResultReference'][0]['_'];
            } else {
                result.nextResult = null;
            }
        } else {
        result.nextResult = null;
    }
    } else {
        result.nextResult = null;
    }

    if (rsp['common_v34_0:HostToken']) {
        if (rsp['common_v34_0:HostToken'][0]) {
            if(rsp['common_v34_0:HostToken'][0]['_']) {
                result.HostToken = rsp['common_v34_0:HostToken'][0]['_'];
            } else {
                result.HostToken = null;
            }
        } else {
        result.HostToken = null;
    }
    } else {
        result.HostToken = null;
    }

    if (rsp['hotel:HotelSearchResult']){
        if (rsp['hotel:HotelSearchResult'][0]){
            result.hotels = rsp['hotel:HotelSearchResult'].map(function(elem) {
                var hotel = {};
                hotel.Name = Utils.beautifyName(elem['hotel:HotelProperty'][0]['$']['Name']);
                hotel.Address = elem['hotel:HotelProperty'][0]['hotel:PropertyAddress'][0]['hotel:Address'][0];
                hotel.HotelCode = elem['hotel:HotelProperty'][0]['$']['HotelCode'];
                hotel.HotelChain = elem['hotel:HotelProperty'][0]['$']['HotelChain'];
                hotel.VendorLocationKey = elem['hotel:HotelProperty'][0]['$']['VendorLocationKey'];
                hotel.Description = elem['hotel:PropertyDescription'][0]['_'];
                if (elem['common_v34_0:MediaItem']){
                    hotel.Icon = elem['common_v34_0:MediaItem'][0]['$']['url'];
                }else{
                    hotel.Icon = null;
                }
                hotel.HotelRating = elem['hotel:HotelProperty'][0]['hotel:HotelRating'][0]['hotel:Rating'] * 1;
                hotel.Rates = elem['hotel:RateInfo'].map(function(rate) {
                    return {
                        RateSupplier: rate['$']['RateSupplier'],
                        RateSupplierLogo: rate['$']['RateSupplierLogo'],
                        PaymentType: rate['$']['PaymentType'],
                        ApproximateMinimumStayAmount: Utils.price(rate['$']['ApproximateMinimumStayAmount']),
                    }
                });
                hotel.Suppliers = hotel.Rates.map(function(elem) {
                    return elem.RateSupplier;
                });

                hotel.Location = {
                    lat: elem['hotel:HotelProperty'][0]['common_v34_0:CoordinateLocation'][0]['$']['latitude'],
                    lng: elem['hotel:HotelProperty'][0]['common_v34_0:CoordinateLocation'][0]['$']['longitude'],
                };
                if (elem['hotel:HotelProperty'][0]['hotel:Amenities']){
                    hotel.Amenties = elem['hotel:HotelProperty'][0]['hotel:Amenities'][0]['hotel:Amenity'].map(function(e) {
                        var amen = {}
                        amen[e['$']['Code']] = amenties[e['$']['Code']];
                        return amen;
                    });
                }else{
                    hotel.Amenties = [];
                }
                return hotel;
            });
        }
    }
    return result;
};

var rateParse = function(obj){
    if (!obj['hotel:HotelDetailsRsp']){
        throw new uError('PARSING_HOTELS_RATES_ERROR', obj);
    }
    var rsp = obj['hotel:HotelDetailsRsp'][0];
    var rateobj = rsp;
    var result = {};

    if (rsp['common_v34_0:HostToken']) {
        if (rsp['common_v34_0:HostToken'][0]) {
            if(rsp['common_v34_0:HostToken'][0]['_']) {
                result.HostToken = rsp['common_v34_0:HostToken'][0]['_'];
            } else {
                result.HostToken = null;
            }
        } else {
        result.HostToken = null;
        }
    } else {
        result.HostToken = null;
    }

    if (rsp['hotel:GuestReviews'] && rsp['hotel:GuestReviews'][0] && rsp['hotel:GuestReviews'][0]['hotel:Comments']) {
        result.Comments = rsp['hotel:GuestReviews'][0]['hotel:Comments'].map(function(comment) {
            return {
                text: comment['_'],
                id: comment['$']['CommentId'],
                date: comment['$']['Date'],
                language: comment['$']['CommenterLanguage']
            };
        })
    } else {
        result.Comments = [];
    }


    result.Agregators = rateobj['hotel:AggregatorHotelDetails'].map(function(rate) {
        var agregator = {};
        if (rate['common_v34_0:MediaItem']){
            agregator.media = rate['common_v34_0:MediaItem'].filter(function(elem) {
                if (elem['$']['type'] !== 'Gallery'){
                    return elem['$'];
                }
            }).map(function(elem) {
                return elem['$'];
            });
        }else{
            agregator.media = [];
        }
        if (rate['hotel:HotelProperty']){
            agregator.hotel = {};
            agregator.hotel.HotelCode = rate['hotel:HotelProperty'][0]['$']['HotelCode'];
            agregator.hotel.HotelChain = rate['hotel:HotelProperty'][0]['$']['HotelChain'];
            agregator.hotel.VendorLocationKey = rate['hotel:HotelProperty'][0]['$']['VendorLocationKey'];
            agregator.hotel.Name = Utils.beautifyName(rate['hotel:HotelProperty'][0]['$']['Name']);
            agregator.hotel.Address = rate['hotel:HotelProperty'][0]['hotel:PropertyAddress'][0]['hotel:Address'];
        }else{
            throw new uError('PARSING_HOTELS_MEDIA_ERROR');
        }

        if (rate['hotel:HotelDetailItem']){
            var detailItem = {};
            agregator.DetailItem = rate['hotel:HotelDetailItem'].map(function(detail) {
                if (detail['hotel:Text'].length === 1){
                    detail['hotel:Text'] = detail['hotel:Text'].join('');
                }
                var name = detail['$']['Name'].split(' ').join('');
                detailItem[name] = detail['hotel:Text'];
            });
            agregator.DetailItem = detailItem;
        }else{
            agregator.DetailItem = {};
        }

        if (rate['hotel:HotelRateDetail']){
            agregator.RateDetail = rate['hotel:HotelRateDetail'].map(function(detail) {
                var roomRate = {};
                detail['hotel:RoomRateDescription'].map(function(roomrate) {
                    if (roomrate['hotel:Text'].length === 1){
                        roomrate['hotel:Text'] = roomrate['hotel:Text'].join('');
                    }
                    var name = roomrate['$']['Name'].split(' ').join('');
                    roomRate[name] = roomrate['hotel:Text'];
                });

                return {
                    RatePlanType: detail['$']['RatePlanType'],
                    Base: Utils.price(detail['$']['Base']),
                    Tax: Utils.price(detail['$']['Tax']),
                    Total: Utils.price(detail['$']['Total']),
                    Surcharge: Utils.price(detail['$']['Surcharge']),
                    RateSupplier: detail['$']['RateSupplier'],
                    RateOfferId: detail['$']['RateOfferId'],
                    BookableQuantity: detail['$']['BookableQuantity'],
                    Capacity: detail['hotel:RoomCapacity'][0]['hotel:Capacity'],
                    IsPackage: JSON.parse(detail['hotel:RoomCapacity'][0]['$']['IsPackage']),
                    CancelInfo: detail['hotel:CancelInfo'] && detail['hotel:CancelInfo'][0]['hotel:CancellationPolicy'][0].replace(/<P>|<B>|<\/P>|<\/B>/g, ''),
                    GuaranteeInfo: {
                        type: (detail['hotel:GuaranteeInfo'][0]['$'])? detail['hotel:GuaranteeInfo'][0]['$']['GuaranteeType'] : null,
                        amount: (detail['hotel:GuaranteeInfo'][0]['hotel:DepositAmount']) ? Utils.price(detail['hotel:GuaranteeInfo'][0]['hotel:DepositAmount'][0]['$']['Amount']) : null,
                    },
                    RoomRateDescription: roomRate,
                }
            });
        }else{
            agregator.RateDetail = [];
        }
        return agregator;
    });

    return result;
};

var bookParse = function(obj) {
    var result = {};
    if (!obj['universal:HotelCreateReservationRsp']){
        throw new uError('PARSING_HOTELS_BOOKING_ERROR', obj);
    }
    var rsp = obj['universal:HotelCreateReservationRsp'][0];
    result.ResponseMessages = rsp['common_v34_0:ResponseMessage'] && rsp['common_v34_0:ResponseMessage'].map(function(msg) {
        return {
            type: msg['$']['Type'],
            text: msg['_']
        };
    });
    var univrec = rsp['universal:UniversalRecord'][0];
    result.LocatorCode = univrec['$']['LocatorCode'];
    result.Status = univrec['$']['Status'];

    result.ProviderReservationInfo = {
        ProviderCode: univrec['universal:ProviderReservationInfo'][0]['$']['ProviderCode'],
        LocatorCode: univrec['universal:ProviderReservationInfo'][0]['$']['LocatorCode'],
        CreateDate: univrec['universal:ProviderReservationInfo'][0]['$']['CreateDate'],
    };

    result.HotelReservation = {
        Status: univrec['hotel:HotelReservation'][0]['$']['Status'],
        AggregatorBookingStatus: univrec['hotel:HotelReservation'][0]['$']['AggregatorBookingStatus'],
        BookingConfirmation: univrec['hotel:HotelReservation'][0]['$']['BookingConfirmation'],
        LocatorCode: univrec['hotel:HotelReservation'][0]['$']['LocatorCode'],
        CreateDate: univrec['hotel:HotelReservation'][0]['$']['CreateDate'],
    };
    return result;
};

var cancelBookParse = function(obj){
    var result = {};
    if (!obj['universal:UniversalRecordCancelRsp']){
        throw new uError('PARSING_HOTELS_CANCEL_BOOKING_ERROR', obj);
    }
    result.Cancelled = JSON.parse(obj['universal:UniversalRecordCancelRsp'][0]['universal:ProviderReservationStatus'][0]['$'].Cancelled);
    result.CreateDate = obj['universal:UniversalRecordCancelRsp'][0]['universal:ProviderReservationStatus'][0]['$'].CreateDate;
    result.CancelInfo = obj['universal:UniversalRecordCancelRsp'][0]['universal:ProviderReservationStatus'][0]['universal:CancelInfo'][0]['_'];
    return result;
};


module.exports = {
    HOTELS_SEARCH_GALILEO_REQUEST : searchParse1G,
    HOTELS_SEARCH_REQUEST : searchParse,
    HOTELS_RATE_REQUEST : rateParse,
    HOTELS_BOOK_REQUEST : bookParse,
    HOTELS_CANCEL_BOOK_REQUEST: cancelBookParse
}