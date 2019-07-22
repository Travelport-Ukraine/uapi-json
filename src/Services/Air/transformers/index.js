const convertPassengersObjectToArray = require('./convert-passengers-object-to-array');
const setBusinessFlag = require('./set-business-flag');
const setPassengersAge = require('./set-passengers-age');
const setHasFareBasisFlag = require('./set-has-farebasis-flag');
const setGroupsForSegments = require('./set-groups-for-segments');
const addMetaPassengersBooking = require('./add-meta-passengers-booking');
const setSSRSegmentRef = require('./set-segment-ref-for-ssr');
const decodeExchangeToken = require('./decode-exchange-token');
const fixCardFop = require('./fix-card-fop');

module.exports = {
  convertPassengersObjectToArray,
  setBusinessFlag,
  setPassengersAge,
  setHasFareBasisFlag,
  setGroupsForSegments,
  addMetaPassengersBooking,
  setSSRSegmentRef,
  decodeExchangeToken,
  fixCardFop,
};
