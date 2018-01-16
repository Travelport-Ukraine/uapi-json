import _ from 'lodash';
import xml2js from 'xml2js';

import {
  RequestSoapError,
  RequestRuntimeError,
} from './RequestErrors';

const parseString = xml => new Promise((resolve, reject) => {
  xml2js.parseString(xml, (err, json) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(json);
  });
});

// common func for all XML keyed
// air:*List types (FlightDetailsList, AirSegmentList, FareInfoList, RouteList, AirPricePointList)
// TODO: for branded fares, air:Brand is referred by BrandID
//  or BrandFound=false and keys are useless
function getItemEmbKey(item) {
  if (item.$ && item.$.Key) {
    return item.$.Key;
  }
  return false;
}

function mergeLeaf(item) {
  const leaf = item.$;
  delete (item.$);
    // item.renameProperty('_', 'text'); //TODO decide if _ is the best name
  return _.extend(item, leaf);
}


/*
 * Default parsing algorithm configuration (for all responses)
 */

export function defaultConfig(ver) {
  // do not collapse arrays with single objects or objects with single keys if they have this name
  const noCollapseList = [
    'air:BookingInfo',
    'air:FareRule',
    // there's one SSR per each airline (per each passenger), they are usually identical
    'common_' + ver + ':SSR',
    'air:AirReservation',
    'air:PassengerType',
    'air:TicketInfo',
    'air:Ticket',
    'air:Coupon',
    'air:AirExchangeBundle',
    'common_' + ver + ':ResponseMessage',
    'common_' + ver + ':BookingTraveler',
    'air:BaggageAllowanceInfo',
    'air:CarryOnAllowanceInfo',
    'hotel:RateInfo',
    'hotel:HotelSearchResult',
    // 'hotel:Amenities',
    'hotel:Amenity',
    'hotel:HotelDetailItem',
    'hotel:AggregatorHotelDetails',
    'common_' + ver + ':MediaItem',
    'util:CurrencyConversion',
    'common_' + ver + ':TaxDetail',
    'common_' + ver + ':SupplierLocator',
    'passive:PassiveReservation',
    'passive:PassiveSegment',
    'passive:PassiveRemark',
    `common_${ver}:Email`,
    'air:ExchangedTicketInfo',
    'air:AirAvailabilityErrorInfo',
    'air:AirSegmentError',
    `common_${ver}:GeneralRemark`,
    'air:AirAvailabilityErrorInfo',
    'air:AirSegmentError',
    `common_${ver}:Endorsement`,
    'air:AirAvailInfo',
    'air:BookingCodeInfo',
  ];

  // Non-single field objects don't get collapsed
  //  from single item arrays into objects automatically, e.g.
  // air:AirReservation
  // air:AirSegment
  // universal:ProviderReservationInfo


  // Some single-object arrays with one key can be safely collapsed into an object or a scalar,
  // because they would never have a second item or any more fields in objects
  // NOTE: if such array name ends in list, e.g. FlightOptionsList (with FlightOption item),
  //  they will not get collapsed
  const fullCollapseListObj = [
    'air:ETR',
    'air:FareTicketDesignator',
    `common_${ver}:Address`,
    `common_${ver}:ShippingAddress`,
    `common_${ver}:PhoneNumber`,
    `common_${ver}:ProviderReservationInfoRef`, // TODO check if can be collapsed
    `common_${ver}:Commission`,
    /*
      Collapses into array of codes, e.g.
      in airPriceRsp/AirPriceResult/AirPricingSolution/AirPricingInfo
    */
    'air:PassengerType',
    // 'air:ChangePenalty', //TODO can be a list of penalties both amount and percent?
    'air:TextInfo',
    'air:FareNote', // removes useless keys
  ];

  // NOTE: for air:PassengerType '$' with one member will get collapsed
  // can't collapse objs: air:ChangePenalty (amount and/or percent),
  //  air:Connection, other keyed lists

  // Some keyed objects' keys are utterly useless, e.g. in air:FareNote
  //  where GDS text is displayed
  // good to use together with fullCollapseListObj
  const dropKeys = [
    'air:FareNote',
  ];

  // Some single-object arrays might have a keyed object,
  //  but we guarantee that there will never be more than one
  const fullCollapseSingleKeyedObj = [
    // 'air:FlightDetails' //can't collapse those in airPriceRsp/AirItinerary/AirSegment,
    //    because they might list several tech stops on flight segment
  ];

  // Keyed lists that contain empty objects can get collapsed into arrays of keys
  const CollapseKeysOnly = [
    'air:FlightDetailsRef', // can be a list of several tech stops
    'air:AirSegmentRef',
    /* 'air:FareInfoRef',*/
    'common_' + ver + ':BookingTravelerRef',
    'common_' + ver + ':ProviderReservationInfoRef',
  ];

  return {
    noCollapseList,
    fullCollapseListObj,
    fullCollapseSingleKeyedObj,
    CollapseKeysOnly,
    dropKeys,
  };
}

export function errorsConfig(/* ver */) {
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
}


export function Parser(root, uapiVersion, env, debug, config) {
  this.debug = debug;
  if (!config) {
    this.config = defaultConfig(uapiVersion);
  } else {
    this.config = config;
  }

  this.uapi_version = uapiVersion;
  this.env = env;
  this.rootObject = root;
}

Parser.prototype.mapArrayKeys = function mapArrayKeys(array, name) {
  const self = this;
  let hasAllKeys = true;

  if (this.config.dropKeys.indexOf(name) === -1) {
    array.forEach((value) => {
      hasAllKeys = hasAllKeys && !!(getItemEmbKey(value));
    });
  } else {
    array.forEach((value) => {
      if (value.$) {
        delete (value.$.Key);
        if (Object.keys(value.$).length === 0) {
          delete (value.$);
        }
      }
    });
    hasAllKeys = false;
  }

  if (!hasAllKeys) {
    _.forEach(array, (value, key) => {
      array[key] = self.mergeLeafRecursive(value, name /* + ':' + key*/);
    });
    return array;
  }

  const object = _.mapKeys(array, getItemEmbKey);
  return self.mergeLeafRecursive(object, name);
};

// TODO make a smart algorithm that checks and simplifies certain structures by metadata description

Parser.prototype.mergeLeafRecursive = function (obj, name) {
  let object;
  const self = this;

  if (_.isArray(obj)) {
    let listName = (name.substr(-4) === 'List') ? name.substring(0, name.length - 4) : name;

    if (_.size(obj) === 1) {
      if (obj[0][listName]) {
        // the XML has e.g. air:FlightDetailsList with one node that is air:FlightDetails
        object = this.mapArrayKeys(obj[0][listName], listName);
      } else if (listName.substr(-1) === 's' && obj[0][listName.substr(0, listName.length - 1)]) {
        listName = listName.substr(0, listName.length - 1);
        // remove plural in one node e.g. FlightOptionsList with FlightOption
        return this.mapArrayKeys(obj[0][listName], listName);
      } else if (typeof (obj[0]) === 'object') {
        if ((this.config.noCollapseList.indexOf(name) === -1 && !getItemEmbKey(obj[0]))
          || (this.config.fullCollapseSingleKeyedObj.indexOf(name) !== -1)) {
          object = this.mergeLeafRecursive(obj[0], name);
        } else { // can't collapse, proceeds with keyed object
          object = this.mapArrayKeys(obj, listName);
        }
      } else {
        return obj[0]; // single scalar in array
      }
    } else {
      object = this.mapArrayKeys(obj, listName);
    }
  } else if (_.isObject(obj)) {
    object = obj;
    const keys = Object.keys(object);

    if (this.config.CollapseKeysOnly.indexOf(name) !== -1) return keys;

    if (keys.length === 1 && this.config.fullCollapseListObj.indexOf(name) !== -1) {
      return this.mergeLeafRecursive(object[keys[0]], name);
    }

    keys.forEach((key) => {
      if (typeof (object[key]) === 'object') {
        if (key === '$') {
          object = mergeLeaf(object);
        } else {
          object[key] = self.mergeLeafRecursive(object[key], key);
        }
      }
    });
  } else {
    return obj;
  }

  if (_.isObject(object)) {
    return mergeLeaf(object);
  }
  return object;
};

Parser.prototype.parseXML = function parseXML(xml) {
  return parseString(xml).then((res) => {
    if (res['SOAP:Envelope']) {
      return res['SOAP:Envelope']['SOAP:Body'][0];
    }
    // TODO replace with custom error, parse other SOAP errors?
    throw new RequestSoapError.SoapParsingError(res);
  }, (err) => {
    throw new RequestSoapError.SoapServerError(null, err);
  });
};

Parser.prototype.parseVersion = function (obj) {
  const detail = obj['SOAP:Fault'][0].detail[0];
  const parsedVersions = Object.keys(detail)
    .filter(
      key => key.match(/ErrorInfo$/i)
    )
    .reduce(
      (acc, key) => acc.concat(
        Object.keys(detail[key][0].$)
        .filter(detailKey => detailKey.match(/^xmlns/i))
        .map(detailKey => detail[key][0].$[detailKey])
      ),
      []
    )
    .map(xmlns => xmlns.match(/_(v\d+_\d+)$/))
    .filter(version => version !== null);
  return parsedVersions[0][1];
};

Parser.prototype.parse = function (xml) {
  const self = this;

  return this.parseXML(xml).then((obj) => {
    const start = new Date();

    if (!self.rootObject) {
      // fall back to custom non-uAPI parser interface with dirty code //FIXME rewrite Hotels
      return obj;
    }

    if (obj['SOAP:Fault']) {
      try {
        this.uapi_version = this.parseVersion(obj);
      } catch (e) {
        throw new RequestRuntimeError.VersionParsingError(obj, e);
      }
      return obj;
    }

    // trying to redefine version based on response;
    try {
      const soapName = self.rootObject.split(':')[0];
      const rootProps = obj[self.rootObject][0].$;
      const version = rootProps[`xmlns:${soapName}`].split(`${soapName}_`).pop();

      self.config = defaultConfig(version);
      self.uapi_version = version;
    } catch (e) {
      throw new RequestRuntimeError.VersionParsingError(obj, e);
    }

    const data = self.mergeLeafRecursive(obj, self.rootObject);

    if (!data[self.rootObject]) {
      throw new RequestSoapError.SoapParsingError(obj);
    }

    const end = new Date() - start;
    if (this.debug > 1) {
      console.info('uAPI_Parse execution time: %dms', end);
    }

    return data[self.rootObject];
  }, (err) => {
    throw new RequestSoapError.SoapParsingError(null, err);
  });
};

export default Parser;
