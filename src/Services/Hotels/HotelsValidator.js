const { HotelsValidationError } = require('./HotelsErrors');

function Validator(params) {
  this.params = params;
  this.reg = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
}

Validator.prototype.end = function () {
  return this.params;
};

Validator.prototype.rooms = function () {
  if (!(this.params.rooms instanceof Array)) {
    throw new HotelsValidationError.RoomsMissing(this.params);
  }
  if (this.params.rooms.length < 1) {
    throw new HotelsValidationError.RoomsMissing(this.params);
  }
  this.params.rooms.forEach((elem) => {
    if (elem.adults < 1) {
      throw new HotelsValidationError.TravellersError.AdultsMissing(this.params);
    }
    if (elem.children) {
      if (!(elem.children instanceof Array)) {
        throw new HotelsValidationError.TravellersError.ChildrenTypeInvalid(this.params);
      }
      elem.children.forEach((child) => {
        if (child < 0 || child > 18) {
          throw new HotelsValidationError.TravellersError.ChildrenAgeInvalid(this.params);
        }
      });
    }
  });
  return this;
};


Validator.prototype.code = function () {
  if (this.params.location) {
    return this;
  }
  if (this.params.code === undefined) {
    throw new HotelsValidationError.LocationMissing(this.params);
  } else if (this.params.code.length > 6) {
    throw new HotelsValidationError.LocationInvalid(this.params);
  }
  return this;
};

Validator.prototype.location = function () {
  if (this.params.code) {
    return this;
  }
  if (this.params.location === undefined) {
    throw new HotelsValidationError.LocationMissing(this.params);
  } else if (this.params.location.length > 3) {
    throw new HotelsValidationError.LocationInvalid(this.params);
  }
  return this;
};

Validator.prototype.startDate = function () {
  if (this.params.startDate === undefined) {
    throw new HotelsValidationError.StartDateMissing(this.params);
  } else if (this.reg.exec(this.params.startDate) == null) {
    throw new HotelsValidationError.StartDateInvalid(this.params);
  }
  return this;
};

Validator.prototype.endDate = function () {
  if (this.params.endDate === undefined) {
    throw new HotelsValidationError.EndDateMissing(this.params);
  } else if (this.reg.exec(this.params.endDate) == null) {
    throw new HotelsValidationError.EndDateInvalid(this.params);
  }
  return this;
};

Validator.prototype.hotelChain = function () {
  if (this.params.HotelChain === undefined) {
    throw new HotelsValidationError.HotelChainMissing(this.params);
  } else if (this.params.HotelChain.length > 2) {
    throw new HotelsValidationError.HotelChainInvalid(this.params);
  }
  return this;
};

Validator.prototype.hotelCode = function () {
  if (this.params.HotelCode === undefined) {
    throw new HotelsValidationError.HotelCodeMissing(this.params);
  }
  return this;
};


Validator.prototype.people = function () {
  if (!(this.params.people instanceof Array) || this.params.people.length < 1) {
    throw new HotelsValidationError.TravellersMissing(this.params);
  }
  this.params.people.forEach((traveler) => {
    if (traveler.FirstName === undefined) {
      throw new HotelsValidationError.FirstNameMissing(this.params);
    }
    if (traveler.LastName === undefined) {
      throw new HotelsValidationError.LastNameMissing(this.params);
    }
    if (traveler.PrefixName === undefined || traveler.PrefixName.length > 4) {
      throw new HotelsValidationError.PrefixNameMissing(this.params);
    }
    if (traveler.Nationality === undefined || traveler.Nationality.length > 2) {
      throw new HotelsValidationError.NationalityMissing(this.params);
    }
    if (traveler.BirthDate === undefined || this.reg.exec(traveler.BirthDate) == null) {
      throw new HotelsValidationError.BirthDateMissing(this.params);
    }
  });
  return this;
};

Validator.prototype.firstPeopleContacts = function () {
  const traveler = this.params.people[0];
  if (traveler.AreaCode === undefined) {
    throw new HotelsValidationError.ContactError.AreaCodeMissing(this.params);
  }
  if (traveler.CountryCode === undefined) {
    throw new HotelsValidationError.ContactError.CountryCodeMissing(this.params);
  }
  if (traveler.Number === undefined) {
    throw new HotelsValidationError.ContactError.NumberMissing(this.params);
  }
  if (traveler.Email === undefined) {
    throw new HotelsValidationError.ContactError.EmailMissing(this.params);
  }
  if (traveler.Country === undefined) {
    throw new HotelsValidationError.ContactError.CountryMissing(this.params);
  } else if (traveler.Country.length !== 2) {
    throw new HotelsValidationError.ContactError.CountryInvalid(this.params);
  }
  if (traveler.City === undefined) {
    throw new HotelsValidationError.ContactError.CityMissing(this.params);
  }
  if (traveler.Street === undefined) {
    throw new HotelsValidationError.ContactError.StreetMissing(this.params);
  }
  if (traveler.PostalCode === undefined) {
    throw new HotelsValidationError.ContactError.PostalCodeMissing(this.params);
  }
  return this;
};

Validator.prototype.guarantee = function () {
  if (this.params.Guarantee === undefined) {
    throw new HotelsValidationError.PaymentDataError.GuaranteeMissing(this.params);
  }
  if (this.params.Guarantee.CVV === undefined) {
    throw new HotelsValidationError.PaymentDataError.CvvMissing(this.params);
  } else if (this.params.Guarantee.CVV.length !== 3) {
    throw new HotelsValidationError.PaymentDataError.CvvInvalid(this.params);
  }
  if (this.params.Guarantee.ExpDate === undefined) {
    throw new HotelsValidationError.PaymentDataError.ExpDateMissing(this.params);
  }
  if (this.params.Guarantee.CardHolder === undefined) {
    throw new HotelsValidationError.PaymentDataError.CardHolderMissing(this.params);
  }
  if (this.params.Guarantee.CardNumber === undefined) {
    throw new HotelsValidationError.PaymentDataError.CardNumberMissing(this.params);
  }
  if (this.params.Guarantee.CardType === undefined) {
    throw new HotelsValidationError.PaymentDataError.CardTypeMissing(this.params);
  } else if (this.params.Guarantee.CardType.length !== 2) {
    throw new HotelsValidationError.PaymentDataError.CardTypeInvalid(this.params);
  }
  return this;
};

Validator.prototype.locatorCode = function () {
  if (this.params.LocatorCode === undefined) {
    throw new HotelsValidationError.LocatorCodeMissing(this.params);
  }
  return this;
};

Validator.prototype.rates = function () {
  if (this.params.rates === undefined) {
    throw new HotelsValidationError.RatesMissing(this.params);
  }
  if (this.params.rates.length < 1) {
    throw new HotelsValidationError.RatesMissing(this.params);
  }

  this.params.rates.forEach((rate) => {
    if (rate.RateOfferId === undefined) {
      throw new HotelsValidationError.RateOfferIdMissing(this.params);
    }

    if (rate.RateSupplier === undefined) {
      throw new HotelsValidationError.RateSupplierMissing(this.params);
    }

    if (rate.RatePlanType === undefined) {
      throw new HotelsValidationError.RatePlanTypeMissing(this.params);
    }

    if (rate.Base === undefined) {
      throw new HotelsValidationError.BasePriceMissing(this.params);
    }

    if (rate.Total === undefined) {
      throw new HotelsValidationError.TotalMissing(this.params);
    }
    if (rate.Tax === undefined) {
      throw new HotelsValidationError.TaxMissing(this.params);
    }
    if (rate.Surcharge === undefined) {
      throw new HotelsValidationError.SurchargeMissing(this.params);
    }
  });
  return this;
};

Validator.prototype.hostToken = function () {
  if (this.params.HostToken === undefined) {
    throw new HotelsValidationError.HostTokenMissing(this.params);
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
