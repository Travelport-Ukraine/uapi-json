const legs = require('./legs');
const passengers = require('./passengers');
const pricingSolutionXml = require('./pricing-solution-xml');
const paramsIsObject = require('./params-is-object');
const fop = require('./fop');
const fopCreditCard = require('./fop-credit-card');
const pnr = require('./pnr');
const pcc = require('./pcc');
const queue = require('./queue');
const ticketNumber = require('./ticket-number');
const flightInfo = require('./flight-info');
const emailOptional = require('./email-optional');
const phone = require('./phone');
const deliveryInfoOptional = require('./delivery-info-optional');
const segments = require('./segments');
const reservationLocator = require('./reservation-locator');
const universalRecordLocator = require('./universal-record-locator-code');
const exchangeToken = require('./exchange-token');
const platingCarrier = require('./platingCarrier');
const searchId = require('./search-id');
const version = require('./version');
const allowDirectAccess = require('./allow-direct-access');

module.exports = {
  legs,
  passengers,
  pricingSolutionXml,
  paramsIsObject,
  allowDirectAccess,
  fop,
  fopCreditCard,
  pnr,
  pcc,
  queue,
  ticketNumber,
  flightInfo,
  emailOptional,
  phone,
  deliveryInfoOptional,
  segments,
  reservationLocator,
  universalRecordLocator,
  exchangeToken,
  platingCarrier,
  searchId,
  version,
};
