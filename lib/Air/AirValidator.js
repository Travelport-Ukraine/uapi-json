var uError = require('../errors'),
    _ = require('lodash');

var moment = require('moment');

function Validator(params){
    this.params = params;
}

Validator.prototype.end = function(){
    return this.params;
};

Validator.prototype.setSearchPassengers = function() {
    var list = [];
    var self = this;

    Object.keys(this.params.passengers).forEach(
        function(ageCategory) {
            var number;
            if (number = self.params.passengers[ageCategory])
                for (i=0; i<number; i++)
                    list.push({
                        ageCategory: ageCategory,
                        child: (ageCategory == 'CNN') //quickfix
                    });

        });

    this.params.passengers = list;

    return this;
};

Validator.prototype.legs = function() {
    if (!_.isArray(this.params.legs))
        throw new uError('LEGS_REQUIRED', this.params);

    this.params.legs.forEach(function(leg, index) {
        ['from', 'to', 'departureDate'].forEach(function(key) {
            if (! leg[key])
                throw new uError('LEGS_REQUIRED_STRUCTURE', {missing: key, index: index, leg: leg});
        });

        //TODO validate departureDate as a date type or valid date string in required format
    });


    return this;
};

Validator.prototype.passengers = function(){
    var self = this;
    if (typeof(this.params.passengers) != 'object')
        throw new uError('PASSENGERS_REQUIRED_LOW', this.params);
    Object.keys(this.params.passengers).forEach(
        function(ageCategory) {
            var number = self.params.passengers[ageCategory];
            if (typeof(ageCategory) != 'string'
                || typeof(number) != 'number')
                throw new uError('PASSENGERS_CATEGORY_INVALID', self.params.passengers);
        }
    );

    return this;
};

Validator.prototype.requestId = function() {
    //FIXME STUB (move to a common method?)
    return this;
};

Validator.prototype.pnr = function() {
    if (!this.params.pnr)
        throw new uError('PNR_REQUIRED', this.params);

    return this;
};

Validator.prototype.queue = function() {
    if (!this.params.queue)
        throw new uError('QUEUE_REQUIRED', this.params);

    return this;
};

Validator.prototype.pcc = function() {
    if (!this.params.pcc)
        throw new uError('PCC_REQUIRED', this.params);

    return this;
};

Validator.prototype.bookedPassengers = function() {
    //TODO check passengers list
    return this;
};

Validator.prototype.removePassengers = function() {
    delete(this.params.passengers);
    return this;
};

Validator.prototype.workaroundPassengers = function() {
    _.forEach(this.params.passengers, function(item) {
        item.ageType="ADT";
    });
    return this;
};

Validator.prototype.uapi_fare_rule_key = function() {
    //TODO check key set
    return this;
};

Validator.prototype.pricingSolutionXML = function() {

    if (!this.params['air:AirPricingSolution'] || typeof(this.params['air:AirPricingSolution']) !== 'object')
        throw new Error('air:AirPricingSolution array is expected');

    return this;
};

//convert all passenger birth dates from DDmmmYY into YYYY-MM-DD
Validator.prototype.passengerBirthDates = function() {
    this.params.passengers.forEach(function (item) {
        var a = moment(item.birthDate, 'DDMMMYY');

        if (!a.isValid())
            throw new Error('Invalid birth date');

        item.DOB = a.format('YYYY-MM-DD');
    });

    return this;
};

module.exports = {
    AIR_LOW_FARE_SEARCH_REQUEST: function(params) {
        return new Validator(params)
            .passengers()
            .legs()
            .requestId()
            .setSearchPassengers()
            .end()
    },

    AIR_AVAILABILITY_REQ: function(params) {
        return new Validator(params)
            .end()
    },

    AIR_PRICE_MANUAL: function(params) {
        return new Validator(params)
            .bookedPassengers() //TODO change into pre-booked?
            //.trips()
            .end()
    },

    AIR_CREATE_RESERVATION_REQUEST: function(params) {
        return new Validator(params)
            .pricingSolutionXML()
            .passengerBirthDates()
            .end()
    },

    AIR_REQUEST_BY_PNR: function(params) {
        return new Validator(params)
            .pnr()
            .end()
    },

    FARE_RULES_BOOKED: function(params) {
        return new Validator(params)
            .workaroundPassengers()
            //.bookedPassengers() //TODO implement validation
            //.trips()
            .end()
    },

    FARE_RULES_TRIPS_TRAVELER_REFS: function(params) {
        return new Validator(params)
            //.trips()  //TODO implement validation
            //.uapi_traveler_refs
            .removePassengers()
            .end()
    },

    FARE_RULES_UNBOOKED: function(params) {
        return new Validator(params)
        .passengers()
        .setSearchPassengers()
        //.bookedPassengers() //TODO implement validation
        //.trips()
        .end()
    },

    FARE_RULES_UAPI: function(params) {
        return new Validator(params)
            .uapi_fare_rule_key()
            .end()
    },

    GDS_QUEUE_PLACE: function (params) {
        return new Validator(params)
            .queue()
            .pnr()
            .pcc()
            .end();
    }
};
