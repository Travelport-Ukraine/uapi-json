const HotelsValidator = require('../../src/Services/Hotels/HotelsValidator');

describe('#HotelsValidator', () => {
  describe('HOTELS_SEARCH_REQUEST()', () => {
    it('sould pass without errors (only adults)', () => {
      const paramsImmutable = {
        location: 'VIE',
        startDate: '2015-09-01',
        endDate: '2015-09-05',
        rooms: [{
          adults: 1,
        }],
      };
      HotelsValidator.HOTELS_SEARCH_REQUEST(paramsImmutable);
    });

    it('sould pass without errors (children + adults)', () => {
      const paramsImmutable = {
        location: 'VIE',
        startDate: '2015-09-01',
        endDate: '2015-09-05',
        rooms: [{
          adults: 1,
          children: [1, 12, 10],
        }],
      };
      HotelsValidator.HOTELS_SEARCH_REQUEST(paramsImmutable);
    });
  });

  describe('HOTELS_RATE_REQUEST()', () => {
    it('sould pass without errors', () => {
      const paramsImmutable = {
        HotelChain: 'IO',
        HotelCode: '23131',
        startDate: '2015-09-01',
        endDate: '2015-09-05',
        rooms: [{
          adults: 1,
          children: [1, 12, 10],
        }],
      };
      HotelsValidator.HOTELS_RATE_REQUEST(paramsImmutable);
    });
  });

  describe('HOTELS_BOOK_REQUEST()', () => {
    it('sould pass without errors', () => {
      const paramsImmutable = {
        people: [{
          key: 1,
          TravelerType: 'ADT',
          FirstName: 'Mark',
          LastName: 'Orel',
          PrefixName: 'MR',
          Nationality: 'US',
          BirthDate: '1994-04-18',
          AreaCode: '093',
          CountryCode: '38',
          Number: '9785352',
          Email: 'mail.ormark@gmail.com',
          Country: 'UA',
          City: 'Kiev',
          Street: 'Borshagivska 148',
          PostalCode: '03056',
        }, {
          key: 2,
          TravelerType: 'ADT',
          FirstName: 'Ina',
          LastName: 'Orel',
          PrefixName: 'MRS',
          Nationality: 'US',
          BirthDate: '1994-10-11',
        }, {
          key: 3,
          TravelerType: 'CNN',
          Age: 10,
          FirstName: 'Dan',
          LastName: 'Orel',
          PrefixName: 'MSTR',
          Nationality: 'US',
          BirthDate: '2005-10-11',
        }],
        Guarantee: {
          CVV: '694',
          ExpDate: '2018-02',
          CardHolder: 'Mark Orel',
          CardNumber: '5300721109295359',
          CardType: 'MC',
          BankName: 'GBC',
          BankCountryCode: 'UA',
        },
        rates: [{
          RatePlanType: 2313,
          RateSupplier: 21312,
          RateOfferId: 231313,
          Total: 2313,
          Base: 2313,
          Surcharge: 1231,
          Tax: 123,
        }],

        HotelCode: 'ATIEV@000003',
        HotelChain: '00',
        startDate: '2015-09-05',
        endDate: '2015-09-05',
        roomsRefs: [{
          adults: 1,
          adultsRefs: [1],
          children: [{
            age: 10,
            key: 3,
          }],
        }, {
          adults: 1,
          adultsRefs: [2],
        }],
        HostToken: 'asdasdas',
      };
      const paramsImmutable2 = {
        people: [{
          TravelerType: 'ADT', PrefixTypes: ['MR', 'MRS', 'MISS'], PrefixName: 'MR', FirstName: 'mark', LastName: 'orel', Nationality: 'UA', BirthDate: '1994-04-18', key: 1, room: 1, Country: 'UA', City: 'kiev', Street: 'street 123', PostalCode: '03000', Email: 'mail.ormark@gmail.com', CountryCode: '38', AreaCode: '093', Number: '1111111'
        }],
        rates: [{
          RatePlanType: 'FFFFFFFFFFFFFFF6',
          Base: 'EUR69.20',
          Tax: 'EUR0.00',
          Total: 'EUR69.20',
          Surcharge: 'EUR0.00',
          RateSupplier: 'AG',
          RateOfferId: 'H4sIAAAAAAAAAGVSO2wTQRAdO7awcRKMLfEpIqWitJ0owVgpyCUQYsmxTUKVBsZ367vD59tld84+UwBpoKCFAgkkCkSVgpIOIQoqCpBoqIAeWiQqdp0EC7HSjjT7Zua9N3f7PyCtJJy8iQMsReQHpU1U3haK9LEvb9+duvFxCpIbcDzg6GygTVzWIUueZMrjgROLi6tgzvQwo2Ne3xzBrOW6krmoi5vYZwRpy+UOEpy2HBTEnG3O+7xl25HA0PaZ0vzFCb8lJY4avqJ479Pck/f4bAoSdUgp/zaLhWZIDFMm6qZ5m/dL7qIa+mR7JddRfe6woORx0tGQvDr/+tu5l3ffJCG1CwVfXWJdjAJqcxEFqIU0oNjhvOeH7jWJAxYwaXgJ8g0jp2zklM3LSgOytucHjkluwR3INGA2jPodJltdy9EjFUHxoCnA0C3XQ2IukytasBB/12ug0iFU+P78xa+9BxeSxlx6gEHEYgn5SV1zPP7+/uO53KOvD5MAB+ZjrW4nEoJLUutGkmThvwRrnAcMww/z8t7np79/aoLdIwKR0N0a72EnYFcjDMmnkfEzQ5DZZgOfDesOwZnaQqe7XO2ySmWxUnG6y5Wl6lJnwakSzGya5bYlF0zSSOdX1hqt5ur1ij61GkG2rtpo99Blysw9AbpkLHOHUJJ1+JzTTpIaGa/uP2SaoLCF8ZG7NpPmWxr0rJZ/GW3P5Oso0Nbyx23pyX8xthPHfwD59QLL2AIAAA==',
          BookableQuantity: '1',
          Capacity: ['1'],
          IsPackage: false,
          CancelInfo: 'This booking is Non-Refundable and cannot be amended or modified. Failure to arrive at your hotel will be treated as a No-Show and no refund will be given (Hotel policy).',
          GuaranteeInfo: { type: 'Prepayment', amount: 'EUR69.20' },
          RoomRateDescription: {
            CommissionOnSurcharges: 'EUR0.00', RateDescription: 'Sell', RoomType: 'Double Room', Description: 'Double Room - Max Occupancy: 1\nPrice Includes: Breakfast\nPrice Excludes: Extra Bed', CommissionAmount: 'EUR3.81', TotalIncludes: ' The Total includes taxes, surcharges but not the fees. ', SupplierTermsandConditions: 'http://www.agoda.com/info/agoda_policies.html'
          },
          CreditCards: ['AX', 'CA', 'VI'],
          Contacts: '+44 (0)20 3027 7900\n\nCS@agoda.com\nOn the Website / In booking confirmation mail\nhttp://www.agoda.com/info/contact_agoda.html'
        }],
        HostToken: 'H4sIAAAAAAAAAFVSPWzTQBj98geERihNJJCKKjIgutlRkqZUHaC0BIxcUpGwdOJiX+xrLz737py4CIG60AFGGEBCYoBKSB0Y2RBigBVGJn5mRsTCwJ1biGrJn/T5fe9979157yfkBIfJdTRERiQJNa4i4a+gMHf0y7v3J299ykC6BccpQ24LOZJxC/LS51j4jLpxeOEi6KcwOqZqUb1ZCfkOFoKwwHIlVJo1B/dw3XHmG42GU3V7s9VG1cWztWZ9vjfn1CUUlnzsbLQj6SKJlZXTjHvGOnORIckAGzZzEF1WUFd1fy536K+XO8U0pK9BgSTYCqGUCBsmyJLPWcAo87YkTNlKxtQyppYxx9hCHAKkOkdaD0Ftmzm8zUnGDKvTHhPOdmTUe/Vxsr85tzqTAYhDxTtzmPfP4BoLcDK/a6ae3qlN/UjmRznI3OwuxbGEiSStFSRhN+Eu5LSZVKUKuslLOHWJsQ0SeFciLKQV9BkfIKlOU+0sjy9pkXO0ZRMh4+3P008+oGcZSFmQFeQ21vEgNcrqqkgVhw0MryZGRDq+4bliwFxMDZ9JVW8wNnjdfPPt3O69t2nIrkGJiGXcRxGVqyyMqDLp2lDu7VvqcjTEFHO9V0LR1nZMbcfUXxZsyDs+oa5udJiSDSeCaNDDvN1fdJWkkFDeJ1EUeKYVSOxhru8jDP//gxoyDqDS9+cvfm/vnE/rcLkhohGOORTHc9cT+ft7j6cnHn19kNZnrWPH8V9HUPmR1wIAAA==',
        Guarantee: {
          CVV: '694', ExpDate: '2018-02', CardHolder: 'Mark Orel', CardNumber: '5598141266802346', CardType: 'MC', BankName: 'DBC', BankCountryCode: 'US'
        },
        startDate: '2016-02-21',
        HotelChain: '00',
        HotelCode: 'GBLON@_000099',
        endDate: '2016-02-22',
        rooms: [{ adults: 1 }],
        currency: 'USD',
        roomsRefs: [{ adults: 1, adultsRefs: [1], children: [] }]
      };
      HotelsValidator.HOTELS_BOOK_REQUEST(paramsImmutable);
      HotelsValidator.HOTELS_BOOK_REQUEST(paramsImmutable2);
    });
  });

  describe('HOTELS_CANCEL_BOOK_REQUEST()', () => {
    it('sould pass without errors', () => {
      const paramsImmutable = {
        LocatorCode: '123123',
      };
      HotelsValidator.HOTELS_CANCEL_BOOK_REQUEST(paramsImmutable);
    });
  });
});
