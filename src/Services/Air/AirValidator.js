import { validate, transform, compose } from '../../utils';
import validators from './validators';
import transformers from './transformers';

module.exports = {
  AIR_LOW_FARE_SEARCH_REQUEST: compose(
    validate(
      validators.passengers,
      validators.legs,
    ),
    transform(
      transformers.convertPassengersObjectToArray,
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

  AIR_CREATE_RESERVATION_REQUEST: compose(
    validate(
      validators.pricingSolutionXml,
    ),
    transform(
      transformers.setPassengersAge,
      transformers.addMetaPassengersBooking,
    )
  ),

  AIR_TICKET: compose(
    validate(
      validators.paramsIsObject,
      validators.fop,
      validators.pnr,
    ),
    transform(),
  ),

  AIR_REQUEST_BY_PNR: compose(
    validate(
      validators.pnr,
    ),
    transform()
  ),

  GDS_QUEUE_PLACE: compose(
    validate(
      validators.pnr,
      validators.pcc,
      validators.queue,
    ),
    transform()
  ),

  AIR_CANCEL_UR: params => params,
  UNIVERSAL_RECORD_FOID: params => params,

  AIR_FLIGHT_INFORMATION: compose(
    validate(
      validators.flightInfo,
    ),
    transform(),
  ),

  AIR_GET_TICKET: compose(
    validate(
      validators.paramsIsObject,
      validators.ticketNumber,
    ),
    transform(),
  ),

  AIR_CANCEL_TICKET: compose(
    validate(
      validators.paramsIsObject,
      validators.pnr,
      validators.ticketNumber,
    ),
    transform()
  ),

  AIR_CANCEL_PNR: compose(
    validate(
      validators.paramsIsObject,
      validators.pnr,
    )
  ),
};
