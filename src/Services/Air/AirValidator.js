import _ from 'lodash';
import moment from 'moment';
import {
  AirValidationError,
  AirFlightInfoValidationError,
  GdsValidationError,
} from './AirErrors';

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
      for (let i = 0; i < number; i += 1) {
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
  if (!this.params.legs) {
    throw new AirValidationError.LegsMissing(this.params);
  }
  if (!_.isArray(this.params.legs)) {
    throw new AirValidationError.LegsInvalidType(this.params);
  }

  this.params.legs.forEach((leg, index) => {
    ['from', 'to', 'departureDate'].forEach((key) => {
      if (!leg[key]) {
        throw new AirValidationError.LegsInvalidStructure({ missing: key, index, leg });
      }
    });

    // TODO validate departureDate as a date type or valid date string in required format
  });

  return this;
};

Validator.prototype.passengers = function () {
  const self = this;
  if (typeof (this.params.passengers) !== 'object') {
    throw new AirValidationError.PassengersHashMissing(this.params);
  }

  Object.keys(this.params.passengers).forEach((ageCategory) => {
    const number = self.params.passengers[ageCategory];
    if ((typeof ageCategory) !== 'string') {
      throw new AirValidationError.PassengersCategoryInvalid(this.params);
    } else if ((typeof number) !== 'number') {
      throw new AirValidationError.PassengersCountInvalid(this.params);
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
    throw new GdsValidationError.PnrMissing(this.params);
  }

  return this;
};

Validator.prototype.queue = function () {
  if (!this.params.queue) {
    throw new GdsValidationError.QueueMissing(this.params);
  }

  return this;
};

Validator.prototype.pcc = function () {
  if (!this.params.pcc) {
    throw new GdsValidationError.PccMissing(this.params);
  }

  return this;
};

Validator.prototype.bookedPassengers = function () {
    // TODO check passengers list
  this.params.business = (this.params.segments[0].serviceClass === 'Business');
  this.params.passengers = this.params.passengers.map((passenger) => {
    const birth = moment(passenger.birthDate.toUpperCase(), 'YYYYMMDD');
    passenger.Age = moment().diff(birth, 'years');
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
  if (Array.isArray(this.params['air:AirPricingSolution'])) {
    throw new AirValidationError.AirPricingSolutionInvalidType();
  }

  return this;
};

// convert all passenger birth dates from DDmmmYY into YYYY-MM-DD
Validator.prototype.passengerBirthDates = function () {
  this.params.passengers.forEach((item) => {
    const birthSSR = moment(item.birthDate.toUpperCase(), 'YYYYMMDD');

    if (!birthSSR.isValid()) {
      throw new AirValidationError.BirthDateInvalid();
    }
    const { passCountry: country,
            passNumber: num,
            firstName: first,
            lastName: last,
            gender } = item;
    const due = moment().add(12, 'month').format('DDMMMYY');
    const birth = birthSSR.format('DDMMMYY');
    item.age = parseInt(moment().diff(birthSSR, 'years'), 10);

    if (item.ageCategory === 'CNN') {
      item.isChild = true;
      if (item.Age < 10) {
        item.ageCategory = `C0${item.Age}`;
      } else {
        item.ageCategory = `C${item.Age}`;
      }
    }

    item.ssr = {
      type: 'DOCS',
      text: `P/${country}/${num}/${country}/${birth}/${gender}/${due}/${last}/${first}`,
    };
    item.DOB = birthSSR.format('YYYY-MM-DD');
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

Validator.prototype.segmentsGroups = function () {
  let group = 0;
  for (let i = 0; i < this.params.segments.length; i += 1) {
    this.params.segments[i].Group = group;
    if (this.params.segments[i].transfer === false) {
      group += 1;
    }
  }
  return this;
};

Validator.prototype.flightInfoItem = function (item) {
  if (!item.airline) {
    throw new AirFlightInfoValidationError.AirlineMissing(item);
  }

  if (!item.flightNumber) {
    throw new AirFlightInfoValidationError.FlightNumberMissing(item);
  }

  if (!item.departure) {
    throw new AirFlightInfoValidationError.DepartureMissing(item);
  }
};

Validator.prototype.flightInfo = function () {
  if (Array.isArray(this.params.flightInfoCriteria)) {
    this.params.flightInfoCriteria.forEach(this.flightInfoItem);
  } else {
    this.flightInfoItem(this.params.flightInfoCriteria);
  }

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
      .segmentsGroups()
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

  AIR_CANCEL_UR(params) {
    return new Validator(params)
            .end();
  },

  UNIVERSAL_RECORD_FOID(params) {
    return new Validator(params)
            .end();
  },


  AIR_FLIGHT_INFORMATION(params) {
    return new Validator(params)
      .flightInfo()
      .end();
  },
};
