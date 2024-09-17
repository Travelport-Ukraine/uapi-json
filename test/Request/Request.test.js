const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const {
  RequestSoapError, RequestRuntimeError,
} = require('../../src/Request/RequestErrors');

const { expect } = chai;
chai.use(sinonChai);

const templates = require('../../src/Services/Air/templates');
const terminalTemplates = require('../../src/Services/Terminal/templates');
const config = require('../testconfig');

const errorXML = fs.readFileSync(path.join(
  __dirname,
  '../FakeResponses/Other/UnableToFareQuoteError.xml'
)).toString();

const serviceParams = [
  'URL',
  {
    username: 'USERNAME',
    password: 'PASSWORD',
  },
  templates.lowFareSearch,
  null,
  () => ({}),
  () => ({}),
  () => ({}),
];

const serviceParamsReturningString = [
  'URL',
  {
    username: 'USERNAME',
    password: 'PASSWORD',
  },
  templates.lowFareSearch,
  null,
  () => ({}),
  () => ({}),
  () => '',
];

const requestError = proxyquire('../../src/Request/uapi-request', {
  axios: {
    request: () => {
      const err = new Error();
      err.response = { status: 300, data: 3 };
      return Promise.reject(err);
    }
  },
});
const requestUnexpectedError = proxyquire('../../src/Request/uapi-request', {
  axios: {
    request: () => {
      const err = new Error();
      err.code = 'ECONNRESET';
      err.message = 'write ECONNRESET';
      err.name = 'Error';
      return Promise.reject(err);
    }
  },
});
const requestJsonResponse = proxyquire('../../src/Request/uapi-request', {
  axios: {
    request: () => Promise.resolve({ data: '{"error": "Some error"}' }),
  },
});
const requestXMLResponse = proxyquire('../../src/Request/uapi-request', {
  axios: {
    request: () => Promise.resolve({ data: '<?xml version="1.0" encoding="UTF-8"?><SOAP:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body><xml>Some xml</xml></SOAP:Body></SOAP:Envelope>' }),
  },
});

const requestXMLError = proxyquire('../../src/Request/uapi-request', {
  axios: {
    request: () => Promise.resolve({ data: errorXML }),
  },
});

describe('#Request', () => {
  describe('Request send', () => {
    it('should throw an SoapRequestError with underlying caused by Error', () => {
      const request = requestError(...serviceParams.concat(3));
      return request({})
        .catch((err) => {
          expect(err).to.be.an.instanceof(RequestSoapError.SoapRequestError);
          expect(err.data).to.not.equal(null);
          expect(err.data.status).to.be.equal(300);
          expect(err.data.data).to.be.equal(3);
          expect(console.log).to.have.callCount(4);
        });
    });
    it('should throw an SoapUnexpectedError with underlying caused by Error without response', () => {
      const request = requestUnexpectedError(...serviceParams.concat(3));
      return request({})
        .catch((err) => {
          expect(err).to.be.an.instanceof(RequestRuntimeError.UAPIServiceError);
          expect(err.data).to.not.equal(null);
          expect(err.data.code).to.equal('ECONNRESET');
        });
    });
    it('should throw SoapServerError when JSON received', () => {
      const request = requestJsonResponse(...serviceParams.concat(3));
      return request({})
        .catch((err) => {
          expect(err).to.be.an.instanceof(RequestSoapError.SoapServerError);
          expect(console.log).to.have.callCount(4);
        });
    });
    it('should call XML parse when XML received', () => {
      const request = requestXMLResponse(...serviceParams.concat(3));
      return request({})
        .then((response) => {
          expect(response).to.deep.equal({});
          expect(console.log).to.have.callCount(6);
        });
    });
    it('should test custom log function with success', () => {
      const log = sinon.spy((...args) => {
        console.log(args);
      });

      const params = serviceParams.concat([3]).concat([{ logFunction: log }]);

      const request = requestXMLResponse(...params);
      return request({})
        .then(() => {
          expect(log).to.have.callCount(6);
        });
    });
    it('should test custom log function with error', () => {
      const log = sinon.spy((...args) => {
        console.log(args);
      });

      const params = serviceParams.concat([3]).concat([{ logFunction: log }]);

      const request = requestXMLError(...params);
      return request({})
        .then(() => {
          expect(log).to.have.callCount(6);
        });
    });
    it('should test result of parser as string', () => {
      const log = sinon.spy((...args) => {
        console.log(args);
      });

      const params = serviceParamsReturningString
        .concat([3])
        .concat([{ logFunction: log }]);

      const request = requestXMLError(...params);
      return request({})
        .then(() => {
          expect(log).to.have.callCount(6);
        });
    });
    it('should handle SOAP:Fault in case when sent with 500 header', async () => {
      const uapiRequest = proxyquire('../../src/Request/uapi-request', {
        axios: {
          request: async () => {
            const error = new Error('Request failed with status code 500');
            error.response = {
              status: 500,
              data: '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"><SOAP:Body><SOAP:Fault><faultcode>Server.System</faultcode><faultstring>String index out of range: 6</faultstring><detail><common_v33_0:ErrorInfo xmlns:common_v33_0="http://www.travelport.com/schema/common_v33_0"><common_v33_0:Code>1</common_v33_0:Code><common_v33_0:Service>SYSTEM</common_v33_0:Service><common_v33_0:Type>System</common_v33_0:Type><common_v33_0:Description>Unexpected system error.</common_v33_0:Description><common_v33_0:TransactionId>8D8D39030A0E7DE522FBC89CC3DAC930</common_v33_0:TransactionId></common_v33_0:ErrorInfo></detail></SOAP:Fault></SOAP:Body></SOAP:Envelope>',
            };
            throw error;
          },
        },
      });

      const errorHandler = sinon.mock().resolves({ error: 'handled' });

      const uapiRequestParams = [
        'URL',
        config,
        terminalTemplates.request,
        null,
        (params) => params,
        errorHandler,
        (res) => res,
        true,
      ];

      const request = uapiRequest(...uapiRequestParams);
      const requestParams = {
        sessionToken: 'SESSION_TOKEN',
        command: 'ER',
      };

      const res = await request(requestParams);
      expect(res).to.deep.equal({ error: 'handled' });

      expect(errorHandler).to.be.calledOnceWith({
        faultcode: 'Server.System',
        faultstring: 'String index out of range: 6',
        detail: {
          'common_v33_0:ErrorInfo': {
            'common_v33_0:Code': '1',
            'common_v33_0:Service': 'SYSTEM',
            'common_v33_0:Type': 'System',
            'common_v33_0:Description': 'Unexpected system error.',
            'common_v33_0:TransactionId': '8D8D39030A0E7DE522FBC89CC3DAC930',
            'xmlns:common_v33_0': 'http://www.travelport.com/schema/common_v33_0'
          }
        }
      });
    });
  });
});
