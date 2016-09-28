const UError = require('../errors');
const _ = require('lodash');

const moment = require('moment');

function Validator(params) {
  this.params = params;
}

Validator.prototype.end = function () {
  return this.params;
};

Validator.prototype.setSearchPassengers = function () {
  const list = [];
  const self = this;

  Object.keys(this.params.passengers).forEach((ageCategory) => {
    const number = self.params.passengers[ageCategory];
    if (number) {
      for (let i = 0; i < number; i++) {
        list.push({
          ageCategory,
          child: (ageCategory === 'CNN'), // quickfix
        });
      }
    }
  });

  this.params.passengers = list;

  return this;
};

Validator.prototype.legs = function () {
  if (!_.isArray(this.params.legs)) {
    throw new UError('LEGS_REQUIRED', this.params);
  }

  this.params.legs.forEach((leg, index) => {
    ['from', 'to', 'departureDate'].forEach((key) => {
      if (!leg[key]) {
        throw new UError('LEGS_REQUIRED_STRUCTURE', { missing: key, index, leg });
      }
    });

    // TODO validate departureDate as a date type or valid date string in required format
  });

  return this;
};

Validator.prototype.passengers = function () {
  const self = this;
  if (typeof (this.params.passengers) !== 'object') {
    throw new UError('PASSENGERS_REQUIRED_LOW', this.params);
  }

  Object.keys(this.params.passengers).forEach((ageCategory) => {
    const number = self.params.passengers[ageCategory];
    if (typeof (ageCategory) !== 'string' || typeof (number) !== 'number') {
      throw new UError('PASSENGERS_CATEGORY_INVALID', self.params.passengers);
    }
  });

  return this;
};

Validator.prototype.requestId = function () {
    // FIXME STUB (move to a common method?)
  return this;
};

Validator.prototype.pnr = function () {
  if (!this.params.pnr) {
    throw new UError('PNR_REQUIRED', this.params);
  }

  return this;
};

Validator.prototype.queue = function () {
  if (!this.params.queue) {
    throw new UError('QUEUE_REQUIRED', this.params);
  }

  return this;
};

Validator.prototype.pcc = function () {
  if (!this.params.pcc) {
    throw new UError('PCC_REQUIRED', this.params);
  }

  return this;
};

Validator.prototype.bookedPassengers = function () {
    // TODO check passengers list
  this.params.passengers = this.params.passengers.map(passenger => {
    if (passenger.ageCategory === 'CNN') {
      passenger.child = true;
    }
    return passenger;
  });
  return this;
};

Validator.prototype.removePassengers = function () {
  delete (this.params.passengers);
  return this;
};

Validator.prototype.workaroundPassengers = function () {
  _.forEach(this.params.passengers, (item) => {
    item.ageType = 'ADT';
  });
  return this;
};

Validator.prototype.uapi_fare_rule_key = function () {
    // TODO check key set
  return this;
};

Validator.prototype.pricingSolutionXML = function () {
  if (!this.params['air:AirPricingSolution']
    || typeof (this.params['air:AirPricingSolution']) !== 'object') {
    throw new Error('air:AirPricingSolution array is expected');
  }

  return this;
};

// convert all passenger birth dates from DDmmmYY into YYYY-MM-DD
Validator.prototype.passengerBirthDates = function () {
  this.params.passengers.forEach((item) => {
    const a = moment(item.birthDate.toUpperCase(), 'DDMMMYY');

    if (!a.isValid()) {
      throw new Error('Invalid birth date');
    }
    const { passCountry: country,
            passNumber: num,
            birthDate: birth,
            firstName: first,
            lastName: last,
            gender } = item;
    const due = moment().add(10, 'month').format('DDMMMYY');

    item.ssr = {
      type: 'DOCS',
      text: `P/${country}/${num}/${country}/${birth}/${gender}/${due}/${first}/${last}`,
    };
    item.DOB = a.format('YYYY-MM-DD');
  });

  return this;
};

Validator.prototype.hasFareBasisCodes = function () {
  const firstBasis = this.params.segments
    && this.params.segments[0]
    && this.params.segments[0].fareBasisCode;
  this.params.hasFareBasis = !_.isEmpty(firstBasis);
  return this;
};

module.exports = {
  AIR_LOW_FARE_SEARCH_REQUEST(params) {
    return new Validator(params)
            .passengers()
            .legs()
            .requestId()
            .setSearchPassengers()
            .end();
  },

  AIR_AVAILABILITY_REQ(params) {
    return new Validator(params)
            .end();
  },

  AIR_PRICE(params) {
    return new Validator(params)
      .bookedPassengers()
      .hasFareBasisCodes()
      .end();
  },

  AIR_PRICE_MANUAL(params) {
    return new Validator(params)
            .bookedPassengers() // TODO change into pre-booked?
            // .trips()
            .end();
  },

  AIR_CREATE_RESERVATION_REQUEST(params) {
    return new Validator(params)
            .pricingSolutionXML()
            .passengerBirthDates()
            .end();
  },

  AIR_REQUEST_BY_PNR(params) {
    return new Validator(params)
            .pnr()
            .end();
  },

  FARE_RULES_BOOKED(params) {
    return new Validator(params)
            .workaroundPassengers()
            // .bookedPassengers() //TODO implement validation
            // .trips()
            .end();
  },

  FARE_RULES_TRIPS_TRAVELER_REFS(params) {
    return new Validator(params)
            // .trips()  //TODO implement validation
            // .uapi_traveler_refs
            .removePassengers()
            .end();
  },

  FARE_RULES_UNBOOKED(params) {
    return new Validator(params)
        .passengers()
        .setSearchPassengers()
        // .bookedPassengers() //TODO implement validation
        // .trips()
        .end();
  },

  FARE_RULES_UAPI(params) {
    return new Validator(params)
            .uapi_fare_rule_key()
            .end();
  },

  GDS_QUEUE_PLACE(params) {
    return new Validator(params)
            .queue()
            .pnr()
            .pcc()
            .end();
  },
};
