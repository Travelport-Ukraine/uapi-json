import path from 'path';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import {
  RequestSoapError,
} from '../../src/Request/RequestErrors';

const expect = chai.expect;
chai.use(sinonChai);

const templatesDir = `${path.join(__dirname, '../../src/Services/Air/templates')}`;
const serviceParams = [
  'URL',
  {
    username: 'USERNAME',
    password: 'PASSWORD',
  },
  `${templatesDir}/AIR_LOW_FARE_SEARCH_REQUEST.xml`,
  null,
  () => ({}),
  () => ({}),
  () => 'PARSED',
];

const requestError = proxyquire('../../src/Request/uapi-request', {
  axios: {
    request: () => Promise.reject(new Error()),
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

describe('#Request', () => {
  describe('Request send', () => {
    beforeEach(() => sinon.spy(console, 'log'));
    afterEach(() => console.log.restore());

    it('should throw an SoapRequestError with underlying caused by Error', () => {
      const request = requestError(...serviceParams.concat(3));
      return request({})
        .catch((err) => {
          expect(err).to.be.an.instanceof(RequestSoapError.SoapRequestError);
          expect(err.causedBy).to.be.an.instanceof(Error);
          expect(console.log).to.have.callCount(5);
        });
    });
    it('should throw SoapServerError when JSON received', () => {
      const request = requestJsonResponse(...serviceParams.concat(3));
      return request({})
        .catch((err) => {
          expect(err).to.be.an.instanceof(RequestSoapError.SoapServerError);
          expect(console.log).to.have.callCount(5);
        });
    });
    it('should call XML parse when XML received', () => {
      const request = requestXMLResponse(...serviceParams.concat(3));
      return request({})
        .then((response) => {
          expect(response).to.equal('PARSED');
          expect(console.log).to.have.callCount(7);
        });
    });
  });
});
