const xml2js = require('xml2js');
const defaultConfig = require('./default-config');
const unescapeJson = require('../utils/unescape-json');

const {
  RequestSoapError,
  RequestRuntimeError,
} = require('./RequestErrors');

const parseString = xml => new Promise((resolve, reject) => {
  xml2js.parseString(xml, (err, json) => {
    if (err) {
      reject(err);
      return;
    }

    resolve(unescapeJson(json));
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

  return Object.assign({}, item, leaf);
}

function Parser(root, uapiVersion, env, debug, config, provider) {
  this.debug = debug;
  if (!config) {
    this.config = defaultConfig(uapiVersion);
  } else {
    this.config = config;
  }

  this.provider = provider || '1G';
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
    return array.map(value => self.mergeLeafRecursive(value, name /* + ':' + key */));
  }

  const object = array
    .reduce((acc, item) => ({ ...acc, [getItemEmbKey(item)]: item }), {});

  return self.mergeLeafRecursive(object, name);
};

// TODO make a smart algorithm that checks and simplifies certain structures by metadata description

Parser.prototype.mergeLeafRecursive = function (obj, name) {
  let object;
  const self = this;

  if (Array.isArray(obj)) {
    let listName = (name.substr(-4) === 'List') ? name.substring(0, name.length - 4) : name;

    if (Object.keys(obj).length === 1) {
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
  } else if (Object.prototype.toString.call(obj) === '[object Object]') {
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

  if (Object.prototype.toString.call(object) === '[object Object]') {
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

  return this
    .parseXML(xml)
    .then((obj) => {
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
    }).catch((err) => {
      throw new RequestRuntimeError.UnhandledError(null, err);
    });
};

module.exports = Parser;
