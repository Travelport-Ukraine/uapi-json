var uError = require('../errors');

function Validator(params){
    this.params = params;
    this.reg = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/;
}

Validator.prototype.end = function(){
    return this.params;
};

Validator.prototype.rooms = function(){
    if (!(this.params.rooms instanceof Array)) {
        throw new uError('VALIDATION_ROOMS', this.params);
    }
    if (this.params.rooms.length < 1) {
        throw new uError('VALIDATION_ROOMS', this.params);
    }
    this.params.rooms.map(function(elem) {
        if (elem.adults < 1) throw new uError('VALIDATION_ADULTS', this.params);
        if (elem.children){
            if (!(elem.children instanceof Array)) throw new uError('VALIDATION_CHILDREN', this.params);
            elem.children.map(function(child) {
                if (child < 0 || child > 18) throw new uError('VALIDATION_CHILDREN_AGE', this.params);
            })
        }
    });
    return this;
};

Validator.prototype.location = function(){
    if (this.params.location == undefined || this.params.location.length>3){
        throw new uError('VALIDATION_LOCATION', this.params);
    }
    return this;
};

Validator.prototype.startDate = function(){
    if (this.params.startDate == undefined || this.reg.exec(this.params.startDate) == null){
        throw new uError('VALIDATION_START_DATE', this.params);
    }
    return this;
};

Validator.prototype.endDate = function(){
    if (this.params.endDate == undefined || this.reg.exec(this.params.endDate) == null){
        throw new uError('VALIDATION_END_DATE', this.params);
    }
    return this;
};

Validator.prototype.HotelChain = function(){
    if (this.params.HotelChain == undefined || this.params.HotelChain.length>2){
        throw new uError('VALIDATION_HOTEL_CHAIN', this.params);
    }
    return this;
};

Validator.prototype.HotelCode = function(){
    if (this.params.HotelCode == undefined){
        throw new uError('VALIDATION_HOTEL_CODE', this.params);
    }
    return this;
};


Validator.prototype.people = function(){
    if (!(this.params.people instanceof Array)) {
        throw new uError('VALIDATION_PEOPLE', this.params);
    }
    if (this.params.people.length < 1) {
        throw new uError('VALIDATION_PEOPLE', this.params);
    }
    var self = this;
    this.params.people.map(function(traveler) {
        if (traveler.FirstName == undefined) {
            throw new uError('VALIDATION_FIRST_NAME',this.params);
        }
        if (traveler.LastName == undefined) {
            throw new uError('VALIDATION_LAST_NAME',this.params);
        }
        if (traveler.PrefixName == undefined || traveler.PrefixName.length > 4) {
            throw new uError('VALIDATION_PREFIX_NAME',this.params);
        }
        if (traveler.Nationality == undefined || traveler.Nationality.length > 2) {
            throw new uError('VALIDATION_NATIONALITY',this.params);
        }
        if (traveler.BirthDate == undefined || self.reg.exec(traveler.BirthDate) == null) {
            throw new uError('VALIDATION_BIRTHDATE',this.params);
        }
    });
    return this;
};

Validator.prototype.FirstPeopleContacts = function(){
    var self = this;
    var traveler = this.params.people[0];
    if (traveler.AreaCode == undefined) {
        throw new uError('VALIDATION_AREA_CODE',this.params);
    }
    if (traveler.CountryCode == undefined) {
        throw new uError('VALIDATION_COUNTRY_CODE',this.params);
    }
    if (traveler.Number == undefined) {
        throw new uError('VALIDATION_PHONE_NUMBER',this.params);
    }
    if (traveler.Email == undefined) {
        throw new uError('VALIDATION_EMAIL',this.params);
    }
    if (traveler.Country == undefined || traveler.Country.length !== 2) {
        throw new uError('VALIDATION_COUNTRY',this.params);
    }
    if (traveler.City == undefined) {
        throw new uError('VALIDATION_CITY',this.params);
    }
    if (traveler.Street == undefined) {
        throw new uError('VALIDATION_STREET',this.params);
    }
    if (traveler.PostalCode == undefined) {
        throw new uError('VALIDATION_POSTAL_CODE',this.params);
    }
    return this;
};

Validator.prototype.Guarantee = function(){
    if (this.params.Guarantee == undefined){
        throw new uError('VALIDATION_GUARANTEE', this.params);
    }
    if (this.params.Guarantee.CVV == undefined || this.params.Guarantee.CVV.length !== 3){
        throw new uError('VALIDATION_CVV', this.params);
    }
    if (this.params.Guarantee.ExpDate == undefined){
        throw new uError('VALIDATION_EXPDATE', this.params);
    }
    if (this.params.Guarantee.CardHolder == undefined){
        throw new uError('VALIDATION_CARDHOLDER', this.params);
    }
    if (this.params.Guarantee.CardNumber == undefined){
        throw new uError('VALIDATION_CARDNUMBER', this.params);
    }
    if (this.params.Guarantee.CardType == undefined || this.params.Guarantee.CardType.length !== 2){
        throw new uError('VALIDATION_CARDTYPE', this.params);
    }
    return this;
};

Validator.prototype.LocatorCode = function(){
    if (this.params.LocatorCode == undefined){
        throw new uError('VALIDATION_LOCATOR_CODE', this.params);
    }
    return this;
};

Validator.prototype.rates = function(){
    if (this.params.rates === undefined){
        throw new uError('VALIDATION_RATES', this.params);
    }
    if (this.params.rates.length < 1){
        throw new uError('VALIDATION_RATES', this.params);
    }

    this.params.rates.map(function(rate) {
        if (rate.RateOfferId == undefined){
            throw new uError('VALIDATION_RATEOFFERID', rate);
        }

        if (rate.RateSupplier == undefined){
            throw new uError('VALIDATION_RATESUPPLIER', rate);
        }

        if (rate.RatePlanType == undefined){
            throw new uError('VALIDATION_RATEPLANTYPE', rate);
        }

        if (rate.Base == undefined){
            throw new uError('VALIDATION_BASE', rate);
        }

        if (rate.Total == undefined){
            throw new uError('VALIDATION_TOTAL', rate);
        }
        if (rate.Tax == undefined){
            throw new uError('VALIDATION_TAX', rate);
        }
        if (rate.Surcharge == undefined){
            throw new uError('VALIDATION_SURCHARGE', rate);
        }
    });
    return this;
};

Validator.prototype.HostToken = function(){
    if (this.params.HostToken == undefined){
        throw new uError('VALIDATION_HOSTTOKEN', this.params);
    }
    return this;
};

module.exports = {
    HOTELS_SEARCH_REQUEST: function(params){
        return new Validator(params)
            .location()
            .startDate()
            .endDate()
            .rooms()
            .end()
    },
    HOTELS_SEARCH_GALILEO_REQUEST: function(params){
        return new Validator(params)
            .location()
            .startDate()
            .endDate()
            // TODO: set here validation for adutls number
            // children number and rooms number
            .end()
    },
    HOTELS_RATE_REQUEST: function(params){
      return new Validator(params)
            .HotelChain()
            .HotelCode()
            .startDate()
            .endDate()
            .rooms()
            .end()
    },
    HOTELS_BOOK_REQUEST: function(params) {
        return new Validator(params)
            .HotelChain()
            .HotelCode()
            .startDate()
            .endDate()
            .people()
            .FirstPeopleContacts()
            .Guarantee()
            .rates()
            .HostToken()
            .end();
    },
    HOTELS_CANCEL_BOOK_REQUEST: function(params) {
        return new Validator(params)
            .LocatorCode()
            .end();
    }
}