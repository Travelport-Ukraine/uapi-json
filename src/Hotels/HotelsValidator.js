const UError = require('../errors');

function Validator(params) {
  this.params = params;
  this.reg = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/;
}

Validator.prototype.end = function () {
  return this.params;
};

Validator.prototype.rooms = function () {
  if (!(this.params.rooms instanceof Array)) {
    throw new UError('VALIDATION_ROOMS', this.params);
  }
  if (this.params.rooms.length < 1) {
    throw new UError('VALIDATION_ROOMS', this.params);
  }
  this.params.rooms.forEach((elem) => {
    if (elem.adults < 1) throw new UError('VALIDATION_ADULTS', this.params);
    if (elem.children) {
      if (!(elem.children instanceof Array)) throw new UError('VALIDATION_CHILDREN', this.params);
      elem.children.forEach((child) => {
        if (child < 0 || child > 18) throw new UError('VALIDATION_CHILDREN_AGE', this.params);
      });
    }
  });
  return this;
};


Validator.prototype.code = function() {
  if (this.params.location) {
    return this;
  }
  if (this.params.code === undefined || this.params.code.length > 6) {
    throw new UError('VALIDATION_LOCATION', this.params);
  }
  return this;
};

Validator.prototype.location = function () {
  if (this.params.code) {
    return this;
  }
  if (this.params.location === undefined || this.params.location.length > 3) {
    throw new UError('VALIDATION_LOCATION', this.params);
  }
  return this;
};

Validator.prototype.startDate = function () {
  if (this.params.startDate === undefined || this.reg.exec(this.params.startDate) == null) {
    throw new UError('VALIDATION_START_DATE', this.params);
  }
  return this;
};

Validator.prototype.endDate = function () {
  if (this.params.endDate === undefined || this.reg.exec(this.params.endDate) == null) {
    throw new UError('VALIDATION_END_DATE', this.params);
  }
  return this;
};

Validator.prototype.hotelChain = function () {
  if (this.params.HotelChain === undefined || this.params.HotelChain.length > 2) {
    throw new UError('VALIDATION_HOTEL_CHAIN', this.params);
  }
  return this;
};

Validator.prototype.hotelCode = function () {
  if (this.params.HotelCode === undefined) {
    throw new UError('VALIDATION_HOTEL_CODE', this.params);
  }
  return this;
};


Validator.prototype.people = function () {
  if (!(this.params.people instanceof Array)) {
    throw new UError('VALIDATION_PEOPLE', this.params);
  }
  if (this.params.people.length < 1) {
    throw new UError('VALIDATION_PEOPLE', this.params);
  }
  const self = this;
  this.params.people.forEach((traveler) => {
    if (traveler.FirstName === undefined) {
      throw new UError('VALIDATION_FIRST_NAME', this.params);
    }
    if (traveler.LastName === undefined) {
      throw new UError('VALIDATION_LAST_NAME', this.params);
    }
    if (traveler.PrefixName === undefined || traveler.PrefixName.length > 4) {
      throw new UError('VALIDATION_PREFIX_NAME', this.params);
    }
    if (traveler.Nationality === undefined || traveler.Nationality.length > 2) {
      throw new UError('VALIDATION_NATIONALITY', this.params);
    }
    if (traveler.BirthDate === undefined || self.reg.exec(traveler.BirthDate) == null) {
      throw new UError('VALIDATION_BIRTHDATE', this.params);
    }
  });
  return this;
};

Validator.prototype.firstPeopleContacts = function () {
  const traveler = this.params.people[0];
  if (traveler.AreaCode === undefined) {
    throw new UError('VALIDATION_AREA_CODE', this.params);
  }
  if (traveler.CountryCode === undefined) {
    throw new UError('VALIDATION_COUNTRY_CODE', this.params);
  }
  if (traveler.Number === undefined) {
    throw new UError('VALIDATION_PHONE_NUMBER', this.params);
  }
  if (traveler.Email === undefined) {
    throw new UError('VALIDATION_EMAIL', this.params);
  }
  if (traveler.Country === undefined || traveler.Country.length !== 2) {
    throw new UError('VALIDATION_COUNTRY', this.params);
  }
  if (traveler.City === undefined) {
    throw new UError('VALIDATION_CITY', this.params);
  }
  if (traveler.Street === undefined) {
    throw new UError('VALIDATION_STREET', this.params);
  }
  if (traveler.PostalCode === undefined) {
    throw new UError('VALIDATION_POSTAL_CODE', this.params);
  }
  return this;
};

Validator.prototype.guarantee = function () {
  if (this.params.Guarantee === undefined) {
    throw new UError('VALIDATION_GUARANTEE', this.params);
  }
  if (this.params.Guarantee.CVV === undefined || this.params.Guarantee.CVV.length !== 3) {
    throw new UError('VALIDATION_CVV', this.params);
  }
  if (this.params.Guarantee.ExpDate === undefined) {
    throw new UError('VALIDATION_EXPDATE', this.params);
  }
  if (this.params.Guarantee.CardHolder === undefined) {
    throw new UError('VALIDATION_CARDHOLDER', this.params);
  }
  if (this.params.Guarantee.CardNumber === undefined) {
    throw new UError('VALIDATION_CARDNUMBER', this.params);
  }
  if (this.params.Guarantee.CardType === undefined || this.params.Guarantee.CardType.length !== 2) {
    throw new UError('VALIDATION_CARDTYPE', this.params);
  }
  return this;
};

Validator.prototype.locatorCode = function () {
  if (this.params.LocatorCode === undefined) {
    throw new UError('VALIDATION_LOCATOR_CODE', this.params);
  }
  return this;
};

Validator.prototype.rates = function () {
  if (this.params.rates === undefined) {
    throw new UError('VALIDATION_RATES', this.params);
  }
  if (this.params.rates.length < 1) {
    throw new UError('VALIDATION_RATES', this.params);
  }

  this.params.rates.forEach((rate) => {
    if (rate.RateOfferId === undefined) {
      throw new UError('VALIDATION_RATEOFFERID', rate);
    }

    if (rate.RateSupplier === undefined) {
      throw new UError('VALIDATION_RATESUPPLIER', rate);
    }

    if (rate.RatePlanType === undefined) {
      throw new UError('VALIDATION_RATEPLANTYPE', rate);
    }

    if (rate.Base === undefined) {
      throw new UError('VALIDATION_BASE', rate);
    }

    if (rate.Total === undefined) {
      throw new UError('VALIDATION_TOTAL', rate);
    }
    if (rate.Tax === undefined) {
      throw new UError('VALIDATION_TAX', rate);
    }
    if (rate.Surcharge === undefined) {
      throw new UError('VALIDATION_SURCHARGE', rate);
    }
  });
  return this;
};

Validator.prototype.hostToken = function () {
  if (this.params.HostToken === undefined) {
    throw new UError('VALIDATION_HOSTTOKEN', this.params);
  }
  return this;
};

module.exports = {
  HOTELS_SEARCH_REQUEST(params) {
    return new Validator(params)
            .code()
            .location()
            .startDate()
            .endDate()
            .rooms()
            .end();
  },
  HOTELS_SEARCH_GALILEO_REQUEST(params) {
    return new Validator(params)
            .location()
            .startDate()
            .endDate()
            // TODO: set here validation for adutls number
            // children number and rooms number
            .end();
  },
  HOTELS_RATE_REQUEST(params) {
    return new Validator(params)
            .hotelChain()
            .hotelCode()
            .startDate()
            .endDate()
            .rooms()
            .end();
  },
  HOTELS_BOOK_REQUEST(params) {
    return new Validator(params)
            .hotelChain()
            .hotelCode()
            .startDate()
            .endDate()
            .people()
            .firstPeopleContacts()
            .guarantee()
            .rates()
            .hostToken()
            .end();
  },
  HOTELS_CANCEL_BOOK_REQUEST(params) {
    return new Validator(params)
            .locatorCode()
            .end();
  },
};
