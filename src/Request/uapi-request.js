const handlebars = require('handlebars');
const axios = require('axios');
const { pd } = require('pretty-data');
const {
  RequestValidationError,
  RequestRuntimeError,
  RequestSoapError,
} = require('./RequestErrors');
const Parser = require('./uapi-parser');
const errorsConfig = require('./errors-config');
const prepareRequest = require('./prepare-request');
const configInit = require('../config');

handlebars.registerHelper('equal', require('handlebars-helper-equal'));

handlebars.registerHelper('capitalize', (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

/**
 * basic function for requests/responses
 * @param  {string} service          service url for current response (gateway)
 * @param  {object} auth             {username,password,targetBranch,provider} - credentials
 * @param  {string} reqType          url to file with xml for current request
 * @param  {object} rootObject
 * @param  {function} validateFunction function for validation
 * @param  {function} errorHandler    function that gets SOAP:Fault object and handle error
 * @param  {function} parseFunction    function for transforming json soap object to normal object
 * @param  {boolean} debugMode        true - log requests, false - dont
 * @param  {object} options
 * @return {Promise}                  returning promise for best error handling ever)
 */
module.exports = function uapiRequest(
  service,
  auth,
  reqType,
  rootObject,
  validateFunction,
  errorHandler,
  parseFunction,
  debugMode = false,
  options = {}
) {
  // Assign default value
  auth.provider = auth.provider || '1G';
  auth.region = auth.region || 'emea';

  const config = configInit(auth.region);
  const log = options.logFunction || console.log;

  // Performing checks
  if (!service || service.length <= 0) {
    throw new RequestValidationError.ServiceUrlMissing();
  }
  if (!auth || auth.username === undefined || auth.password === undefined) {
    throw new RequestValidationError.AuthDataMissing();
  }
  if (reqType === undefined) {
    throw new RequestValidationError.RequestTypeUndefined();
  }
  if (Object.prototype.toString.call(reqType) !== '[object String]') {
    throw new RequestRuntimeError.TemplateFileMissing();
  }

  return function serviceFunc(params) {
    if (debugMode) {
      log('Input params ', pd.json(params));
    }

    // create a v47 uAPI parser with default params and request data in env
    const uParser = new Parser(rootObject, 'v47_0', params, debugMode, null, auth.provider);

    const validateInput = () => (
      Promise.resolve(params)
        .then(validateFunction)
        .then((validatedParams) => {
          params = validatedParams;
          uParser.env = validatedParams;
          return reqType;
        }));

    const sendRequest = function (xml) {
      if (debugMode) {
        log('Request URL: ', service);
        log('Request XML: ', pd.xml(xml));
      }
      return axios.request({
        url: service,
        method: 'POST',
        timeout: config.timeout || 5000,
        auth: {
          username: auth.username,
          password: auth.password,
        },
        headers: {
          'Accept-Encoding': 'gzip',
          'Content-Type': 'text/xml',
        },
        data: xml,
      })
        .then((response) => {
          if (debugMode) {
            log('Response SOAP: ', pd.xml(response.data));
          }
          return response.data;
        })
        .catch((e) => {
          const rsp = e.response;

          if (!rsp) {
            if (debugMode) {
              log('Unexpected Error: ', pd.json(e));
            }

            return Promise.reject(new RequestSoapError.SoapUnexpectedError(e));
          }

          const error = {
            status: rsp.status,
            data: rsp.data,
          };

          if (debugMode) {
            log('Error Response SOAP: ', pd.json(error));
          }

          return Promise.reject(new RequestSoapError.SoapRequestError(error));
        });
    };

    const parseResponse = function (response) {
      // if there are web server or HTTP auth errors, uAPI returns a JSON
      let data = null;
      try {
        data = JSON.parse(response);
      } catch (err) {
        return uParser.parse(response);
      }

      // TODO parse JSON errors
      return Promise.reject(new RequestSoapError.SoapServerError(data));
    };

    const validateSOAP = function (parsedXML) {
      if (parsedXML['SOAP:Fault']) {
        if (debugMode > 2) {
          log('Parsed error response', pd.json(parsedXML));
        }
        // use a special uAPI parser configuration for errors, copy detected uAPI version
        const errParserConfig = errorsConfig();
        const errParser = new Parser(
          rootObject,
          uParser.uapi_version,
          params,
          debugMode,
          errParserConfig,
          auth.provider
        );
        const errData = errParser.mergeLeafRecursive(parsedXML['SOAP:Fault'][0]); // parse error data
        return errorHandler.call(errParser, errData);
      }

      if (debugMode > 2) {
        log('Parsed response', pd.json(parsedXML));
      }

      return parsedXML;
    };

    const handleSuccess = function (result) {
      if (debugMode > 1) {
        if (typeof result === 'string') {
          log('Returning result', result);
        } else {
          log('Returning result', pd.json(result));
        }
      }
      return result;
    };


    return validateInput()
      .then(handlebars.compile)
      .then(template => prepareRequest(template, auth, params))
      .then(sendRequest)
      .then(parseResponse)
      .then(validateSOAP)
      .then(parseFunction.bind(uParser)) // TODO: merge Hotels
      .then(handleSuccess);
  };
};
