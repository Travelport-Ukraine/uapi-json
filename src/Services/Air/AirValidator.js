const { validate, transform, compose } = require('../../utils');
const validators = require('./validators');
const transformers = require('./transformers');

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

  AIR_RETRIEVE_LOW_FARE_SEARCH_REQUEST: compose(
    validate(
      validators.searchId
    ),
    transform()
  ),

  AIR_PRICE_FARE_RULES_REQUEST: compose(
    validate(
      validators.segments,
      validators.passengers,
      validators.platingCarrier
    ),
    transform(
      transformers.setBusinessFlag,
      // transformers.setGroupsForSegments, <air:Connection/> hack fails validation on pre-prod
      transformers.setHasFareBasisFlag,
      transformers.convertPassengersObjectToArray
    )
  ),

  AIR_PRICE_REQUEST: compose(
    validate(
      validators.segments,
      validators.passengers,
      validators.platingCarrier
    ),
    transform(
      transformers.setBusinessFlag,
      transformers.convertPassengersObjectToArray,
      transformers.setGroupsForSegments,
      transformers.setHasFareBasisFlag
    )
  ),

  AIR_PRICE: compose(
    validate(
      validators.segments,
      validators.platingCarrier
    ),
    transform(
      transformers.setBusinessFlag,
      transformers.setPassengersAge,
      transformers.setGroupsForSegments,
      transformers.setHasFareBasisFlag
    )
  ),

  AIR_CREATE_RESERVATION_REQUEST: compose(
    validate(
      validators.emailOptional,
      validators.phone,
      validators.deliveryInfoOptional,
      validators.pricingSolutionXml
    ),
    transform(
      transformers.setPassengersAge,
      transformers.addMetaPassengersBooking
    )
  ),

  AIR_TICKET: compose(
    validate(
      validators.paramsIsObject,
      validators.fop,
      validators.fopCreditCard,
      validators.pnr
    ),
    transform(
      transformers.fixCardFop
    )
  ),

  AIR_REQUEST_BY_PNR: compose(
    validate(
      validators.pnr
    ),
    transform()
  ),

  GDS_QUEUE_PLACE: compose(
    validate(
      validators.pnr,
      validators.pcc,
      validators.queue
    ),
    transform()
  ),

  UNIVERSAL_RECORD_RETRIEVE: compose(
    validate(
      validators.universalRecordLocator
    ),
    transform()
  ),

  AIR_CANCEL_UR: params => params,
  UNIVERSAL_RECORD_FOID: params => params,

  AIR_FLIGHT_INFORMATION: compose(
    validate(
      validators.flightInfo
    ),
    transform()
  ),

  AIR_GET_TICKET: compose(
    validate(
      validators.paramsIsObject,
      validators.ticketNumber
    ),
    transform()
  ),

  AIR_GET_TICKETS: compose(
    validate(
      validators.paramsIsObject,
      validators.reservationLocator
    ),
    transform()
  ),

  AIR_CANCEL_TICKET: compose(
    validate(
      validators.paramsIsObject,
      validators.pnr,
      validators.ticketNumber
    ),
    transform()
  ),

  AIR_CANCEL_PNR: compose(
    validate(
      validators.paramsIsObject,
      validators.pnr
    ),
    transform()
  ),

  AIR_EXCHANGE_QUOTE: compose(
    validate(
      validators.segments,
      validators.pnr
    ),
    transform()
  ),

  AIR_EXCHANGE: compose(
    validate(
      validators.pnr,
      validators.reservationLocator,
      validators.exchangeToken
    ),
    transform(
      transformers.decodeExchangeToken
    )
  ),
};
