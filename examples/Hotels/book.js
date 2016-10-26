const uAPI = require('../../index');
const config = require('../../test/testconfig');
const moment = require('moment');

const HotelService = uAPI.createHotelService(
  {
    auth: config,
    debug: 2,
    production: true,
  }
);

const search = {
  location: 'LON',
  startDate: moment().add(30, 'days').format('YYYY-MM-DD'),
  endDate: moment().add(35, 'days').format('YYYY-MM-DD'),
  currency: 'USD',
  MaxWait: 30000,
  MaxProperties: 9999,
  rooms: [{
    adults: 1,
  }],
  rating: [3, 5],
};

var bookingInfo = {
  people: [{
    key: 1,
    TravelerType: "ADT",
    FirstName: "Almer",
    LastName: "Palmer",
    PrefixName: "MR",
    Nationality: "US",
    BirthDate: "1988-04-18",
    AreaCode: "111",
    CountryCode: "1",
    Number: "12345678",
    Email: "almer.parmer@alem.com",
    Country: "US",
    City: "Dreamland",
    Street: "Dream 123 street",
    PostalCode: "03056"
  }],
  Guarantee: {
    CVV: "111",
    ExpDate: "2023-02",
    CardHolder: "THE NAME",
    CardNumber: "4111111111111111",
    CardType: "VI",
    BankName: "GBC",
    BankCountryCode: "US",
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
  }],
  HostToken: null,
};

HotelService.search(search).then(data => {
  const hotelMediaParams = data.hotels[0];
  const rateReq = Object.assign({}, hotelMediaParams, search);
  bookingInfo = Object.assign(bookingInfo, search, hotelMediaParams);
  return HotelService.rates(rateReq);
}).then(
  rates => {
    bookingInfo.rates[0] = Object.assign(bookingInfo.rates[0], rates.Agregators[0].RateDetail[0]);
    bookingInfo.HostToken = rates.HostToken;
    return HotelService.book(bookingInfo);
  }
).then(
  res => console.log(res),
  err => console.log(err)
);
