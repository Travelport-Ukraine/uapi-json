import _ from 'lodash';
import moment from 'moment';
import {
  AirValidationError,
  AirFlightInfoValidationError,
  GdsValidationError,
} from './AirErrors';

import { validate, transform, compose } from '../../utils';
import validators from './validators';
import transformers from './transformers';

function Validator(params) {
  this.params = params;
}

Validator.prototype.end = function () {
  return this.params;
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


Validator.prototype.pricingSolutionXML = function () {
  if (Array.isArray(this.params['air:AirPricingSolution'])) {
    throw new AirValidationError.AirPricingSolutionInvalidType();
  }

  return this;
};

// convert all passenger birth dates from DDmmmYY into YYYY-MM-DD
Validator.prototype.passengerBirthDates = function () {
  this.params.passengers.forEach((item) => {
    const birthSSR = moment(item.birthDate.toUpperCase(), 'YYYY-MM-DD');

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

Validator.prototype.fop = function () {
  if (!this.params.fop) {
    throw new AirValidationError.FopMissing();
  }
  if (
    Object.prototype.toString.call(this.params.fop) !== '[object Object]' ||
    this.params.fop.type !== 'Cash'
  ) {
    throw new AirValidationError.FopTypeUnsupported();
  }
  return this;
};

Validator.prototype.ticketNumber = function () {
  if (!this.params.ticketNumber) {
    throw new AirValidationError.TicketNumberMissing();
  }
  if (!String(this.params.ticketNumber).match(/^\d{13}/)) {
    throw new AirValidationError.TicketNumberInvalid();
  }
  return this;
};

Validator.prototype.paramsIsObject = function () {
  if (!this.params) {
    throw new AirValidationError.ParamsMissing(this.params);
  }
  if (Object.prototype.toString.call(this.params) !== '[object Object]') {
    throw new AirValidationError.ParamsInvalidType(this.params);
  }
  return this;
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
  AIR_LOW_FARE_SEARCH_REQUEST: compose(
    validate(
      validators.passengers,
      validators.legs
    ),
    transform(
      transformers.convertPassengersObjectToArray
    )
  ),

  AIR_PRICE: compose(
    validate(),
    transform(
      transformers.setBusinessFlag,
      transformers.setPassengersAge,
      transformers.setGroupsForSegments,
      transformers.setHasFareBasisFlag,
    )
  ),

  AIR_CREATE_RESERVATION_REQUEST(params) {
    return new Validator(params)
      .pricingSolutionXML()
      .passengerBirthDates()
      .end();
  },

  AIR_TICKET(params) {
    return new Validator(params)
      .paramsIsObject()
      .pnr()
      .fop()
      .end();
  },

  AIR_REQUEST_BY_PNR(params) {
    return new Validator(params)
      .pnr()
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

  AIR_GET_TICKET(params) {
    return new Validator(params)
      .paramsIsObject()
      .ticketNumber()
      .end();
  },
};
