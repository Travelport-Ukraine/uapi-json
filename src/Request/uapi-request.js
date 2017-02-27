import handlebars from 'handlebars';
import fs from 'fs';
import request from 'request';
import {
  RequestValidationError,
  RequestRuntimeError,
  RequestSoapError,
} from './RequestErrors';
import UapiParser from './uapi-parser';
import configInit from '../config';

// making default functions work with promises
const readFile = file => new Promise((resolve, reject) => {
  fs.readFile(file, (err, content) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(content);
  });
});

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

  // Logging
  if (debugMode > 2) {
    console.log('Starting working with ', reqType, toString());
  }

  // Performing checks
  if (!service || service.length <= 0) {
    throw new RequestValidationError.ServiceUrlMissing();
  } else if (!auth || auth.username === undefined || auth.password === undefined) {
    throw new RequestValidationError.AuthDataMissing();
  } else if (reqType === undefined) {
    throw new RequestValidationError.RequestTypeUndefined();
  } else if (fs.existsSync(reqType) === false) {
    throw new RequestRuntimeError.TemplateFileMissing();
  }

  return function serviceFunc(params) {
    if (debugMode) {
      console.log('Input params ', params);
    }

    // create a v36 uAPI parser with default params and request data in env
    const uParser = new UapiParser(rootObject, 'v36_0', params, debugMode);

    const validateInput = (resolve) => {
      params = validateFunction(params);
      uParser.env = params;
      resolve(reqType);
    };

    const prepareRequest = function (template) {
      // adding target branch param from auth variable and render xml
      params.TargetBranch = auth.targetBranch;
      params.Username = auth.username;
      params.emulatePcc = auth.emulatePcc || false;
      const renderedObj = template(params);
      return renderedObj;
    };

    const sendRequest = function (xml) {
      if (debugMode) {
        console.log('Request URL: ', service);
        console.log('Request XML: ', xml);
      }
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
          // Error handling
          if (error) {
            if (debugMode) {
              console.log('Error Response SOAP: ', JSON.stringify(error));
            }
            if (error.code === 'ETIMEDOUT') {
              reject(new RequestSoapError.SoapRequestTimeout());
            } else {
              reject(new RequestSoapError.SoapRequestError());
            }
            return;
          }
          // Response handling
          if (debugMode > 1) {
            console.log('Response SOAP: ', response.body);
          }
          resolve(response);
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
      throw new RequestSoapError.SoapServerError(data); // TODO change into UAPI_SERVER_ERROR, etc
    };

    const validateSOAP = function (parsedXML) {
      if (parsedXML['SOAP:Fault']) {
        if (debugMode) {
          console.log('Parsed error response', JSON.stringify(parsedXML));
        }
        const errData = uParser.mergeLeafRecursive(parsedXML['SOAP:Fault'][0]); // parse error data
        return errorHandler.call(uParser, errData);
      } else if (debugMode > 1) {
        console.log('Parsed response', JSON.stringify(parsedXML));
      }

      return parsedXML;
    };

    const handleSuccess = function (result) {
      if (debugMode > 1) {
        console.log('Returning result', JSON.stringify(result));
      }
      return result;
    };


    return new Promise(validateInput)
      .then(readFile)
      .then(buffer => buffer.toString())
      .then(handlebars.compile)
      .then(prepareRequest)
      .then(sendRequest)
      .then(parseResponse)
      .then(validateSOAP)
      .then(parseFunction.bind(uParser))// TODO merge Hotels
      .then(handleSuccess);
  };
};
