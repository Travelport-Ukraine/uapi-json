const Mustache = require('consolidate').handlebars;
const fs = require('fs');
const request = require('request');
const Promise = require('promise');
const ParserUapi = require('./uapi-parser');

// making default functions work with promises
const readFile = Promise.denodeify(fs.readFile);
const UError = require('./errors');
const configInit = require('./config');

/**
 * basic function for requests/responses
 * @param  {string} service          service url for current response (gateway)
 * @param  {object} auth             {username,password} - credentials
 * @param  {string} reqType          url to file with xml for current request
 * @param  {function} validateFunction function for validation
 * @param  {function} errorHandler    function that gets SOAP:Fault object and handle error
 * @param  {function} parseFunction    function for transforming json soap object to normal object
 * @param  {boolean} debugMode        true - log requests, false - dont
 * @return {Promise}                  returning promise for best error handling ever)
 */
module.exports = function (service, auth, reqType, rootObject,
  validateFunction, errorHandler, parseFunction, debugMode = false) {
  const config = configInit(auth.region || 'emea');

  if (debugMode > 2) {
    console.log('Starting working with ', reqType, toString());
  }

  if (service.length <= 0) {
    throw new UError('UNDEFINED_SERVICE_URL');
  }

  if (!auth || auth.username === undefined || auth.password === undefined) {
    throw new UError('UNDEFINED_AUTH_DATA');
  }

  if (reqType === undefined) {
    throw new UError('UNDEFINED_REQUEST_TYPE');
  }
  if (fs.existsSync(reqType) === false) {
    throw new UError('NO_TEMPLATE_FILE', { msg: reqType });
  }

  return function serviceFunc(params) {
    if (debugMode) {
      console.log('Input params ', params);
    }

    // create a v36 uAPI parser with default params and request data in env
    const uParser = new ParserUapi(rootObject, 'v_36_0', params);

    const validateInput = (resolve, reject) => {
      if (params === undefined) {
        reject(new UError('EMPTY_PARAMS'));
      }
      params = validateFunction(params);
      resolve(reqType);
    };

    const prepareRequest = function (data) {
      // adding target branch param from auth variable and render xml
      params.TargetBranch = auth.targetBranch;
      params.Username = auth.username;
      params.pcc = auth.pcc;
      const renderedObj = Mustache.render(data.toString(), params);
      return renderedObj;
    };

    const sendRequest = function (xml) {
      if (debugMode) console.log('Request XML: ', xml);
      return new Promise((resolve, reject) => {
        request({
          url: service, // URL to hit
          method: 'POST',
          timeout: config.timeout || 5000,
          gzip: true,
          auth: {
            user: auth.username,
            pass: auth.password,
            sendImmediately: true,
          },
          body: xml,
        }, (error, response) => {
          if (!error) {
            if (debugMode > 1) console.log('Response SOAP: ', response.body);
            resolve(response);
          } else {
            if (debugMode) console.log('Error Response SOAP: ', JSON.stringify(error));
            if (error.code === 'ETIMEDOUT') {
              reject(new UError('SOAP_REQUEST_TIMEOUT'));
            } else {
              reject(new UError('SOAP_REQUEST_ERROR'));
            }
          }
        });
      });
    };

    const parseResponse = function (response) {
      // if there are web server or HTTP auth errors, uAPI returns a JSON
      let data = null;
      try {
        data = JSON.parse(response.body);
      } catch (err) {
        return uParser.parse(response.body);
      }

      // TODO parse JSON errors
      throw new UError('UNDEFINED_AUTH_DATA', data); // TODO change into UAPI_SERVER_ERROR, etc
    };

    const validateSOAP = function (parsedXML) {
      if (parsedXML['SOAP:Fault']) {
        if (debugMode) console.log('Parsed error response', JSON.stringify(parsedXML));
        return errorHandler(parsedXML['SOAP:Fault']);
      } else
                if (debugMode > 1) console.log('Parsed response', JSON.stringify(parsedXML));

      return parsedXML;
    };

    const handleSuccess = function (result) {
      if (debugMode > 1) console.log('Returning result', JSON.stringify(result));
      return result;
    };

    return new Promise(validateInput)
            .then(readFile)
            .then(prepareRequest)
            .then(sendRequest)
            .then(parseResponse)
            .then(validateSOAP)
            .then(parseFunction.bind(uParser))// TODO merge Hotels
            .then(handleSuccess);
  };
};
