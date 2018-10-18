const defaultConfig = require('./default-config');

module.exports = function errorsConfig(/* ver */) {
  // get default config and modify it
  const errParserConfig = defaultConfig();
  // 1. If waitlisted with restrictWaitlist=true, reply will be SOAP:Fault,
  // this error reply will contain <air:AvailabilityErrorInfo> / <air:AirSegmentError>
  // lists with <air:AirSegment> keyed objects;
  // but, each <air:AirSegmentError> will contain only one object,
  // so <air:AirSegment> keyed list can be collapsed.
  // If there are several errors for a particular segment, there will be two errors
  // with segment information copied.
  // Unlike this, in LowFareShoppingRsp <air:AirSegment> is usually a list.
  errParserConfig.fullCollapseSingleKeyedObj.push('air:AirSegment');
  errParserConfig.fullCollapseListObj.push('air:ErrorMessage');
  // return config
  return errParserConfig;
};
