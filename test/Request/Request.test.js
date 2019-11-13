const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const {
  RequestSoapError,
} = require('../../src/Request/RequestErrors');

const { expect } = chai;
chai.use(sinonChai);

const templates = require('../../src/Services/Air/templates');

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
    request: () => Promise.reject({ response: { status: 300, data: 3 } }),
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
  });
});
