var proxy  = require('proxyquire'),
    sinon  = require('sinon'),
    assert = require('assert'),
    moment = require('moment'),
    assign = require('object-assign');

var uAPI = require('../../index');
var config = require('../testconfig.js');
var HotelService = uAPI.createHotelService(
    {
        auth: config,
        debug: true,
        production: false
    }
);

var hotelSearchParams = {
    location : 'LON',
    startDate: moment().add(30, 'days').format('YYYY-MM-DD'),
    endDate:  moment().add(35, 'days').format('YYYY-MM-DD'),
    rooms: [{
        adults: 1,
        // children: [10],
    }],
    rating: [3,5]
};

var hotelMediaParams = {
    HotelCode: null,
    HotelChain: null,
    VendorLocationKey: null,
    HostToken: null,
};

var bookingInfo = {
    people: [{
        key: 1,
        TravelerType: "ADT",
        FirstName: "Mark",
        LastName: "Orel",
        PrefixName: "MR",
        Nationality: "US",
        BirthDate: "1994-04-18",
        AreaCode: "093",
        CountryCode: "38",
        Number: "9785352",
        Email: "mail.ormark@gmail.com",
        Country: "UA",
        City: "Kiev",
        Street: "Borshagivska 148",
        PostalCode: 03056
    },
    //     {
    //     key: 2,
    //     TravelerType: "ADT",
    //     FirstName: "Ina",
    //     LastName: "Orel",
    //     PrefixName: "MRS",
    //     Nationality: "US",
    //     BirthDate: "1994-10-11",
    // },{
    //     key: 3,
    //     TravelerType: "CNN",
    //     Age: 10,
    //     FirstName: "Dan",
    //     LastName: "Orel",
    //     PrefixName: "MSTR",
    //     Nationality: "US",
    //     BirthDate: "2005-10-11",
    // }
    ],
    Guarantee: {
        CVV: "694",
        ExpDate: "2018-02",
        CardHolder: "Mark Orel",
        CardNumber: "5300721109295359",
        CardType: "MC",
        BankName: "GBC",
        BankCountryCode: "UA",
    },
    rates: [{
        RatePlanType: null,
        RateSupplier: null,
        RateOfferId: null,
        Total: null,
        Base: null,
        Surcharge: null,
        Tax: null,
    }],

    HotelCode: null,
    HotelChain: null,
    startDate: null,
    endDate: null,
    roomsRefs: [{
        adults: 1,
        adultsRefs: [1],
        // children: [{
        //     age: 10,
        //     key: 3
        // }],
    }],
    HostToken: null,
};

var cancelBook = {
    LocatorCode: "ZMCQTS"
};

bookingInfo = assign(bookingInfo, hotelSearchParams);

describe('#HotelsService', function () {
    describe('searchHotels()', function () {
        it('give response object', function () {
            this.timeout('200000');
            return HotelService.search(hotelSearchParams).then(function(data) {
                console.log(data);
                bookingInfo.HostToken = data.HostToken;
                hotelSearchParams.nextResult = data.nextResult;
                hotelMediaParams = data.hotels[0];
                hotelMediaParams.HostToken = data.HostToken;
            }, function(err) { console.log(err)});
        });
    });

    describe('hotelRate()', function () {
        it('give response object', function () {
            this.timeout('220000');
            hotelMediaParams = assign(hotelMediaParams, hotelSearchParams);
            bookingInfo = assign(bookingInfo, hotelMediaParams);
            return HotelService.rates(hotelMediaParams).then(function(data) {
                console.log(data);
                    bookingInfo.rates[0] = assign(bookingInfo.rates[0], data.Agregators[0].RateDetail[0]);
                    // bookingInfo.rates[1] = assign(bookingInfo.rates[0], data.Agregators[0].RateDetail[0]);
                    assert.notEqual(data.Agregators, undefined, 'No rate info');
                    assert.notEqual(data.HostToken, undefined, 'No detail item info');
            }, function (err) {
                throw err;
            });
        });
    });
    describe('hotelBook()', function () {
        it('give response object', function () {
            this.timeout('100000');
            console.log(JSON.stringify(bookingInfo));
            return HotelService.book(bookingInfo).then(function(data) {
                assert.notEqual(data.LocatorCode, undefined, 'Booking not created');
                cancelBook.LocatorCode = data.LocatorCode;
            }, function(err) { console.log(JSON.stringify(err))});
        });
    });

    describe('hotelCancelBook()', function () {
        it('give response object', function () {
            this.timeout('100000');
            if (bookingInfo.rates[0].RateSupplier === 'TO' || bookingInfo.rates[0].RateSupplier==='AG' || bookingInfo.roomsRefs.length > 1) {
                return;
            }
            return HotelService.cancelBook(cancelBook).then(function(data) {
                assert.equal(data.Cancelled, true, 'Booking not canceled');
            }, function(err) { console.log(JSON.stringify(err))});
        });
    });
});
