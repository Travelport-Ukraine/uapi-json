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
  (x) => {console.log(x)},
  (x) => {console.log(x)},
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

describe('#Request', () => {
  describe('Request send', () => {
    it('should throw an SoapRequestError with underlying caused by Error', () => {
      const request = requestError(...serviceParams);
      return request({})
        .catch((err) => {
          expect(err).to.be.an.instanceof(RequestSoapError.SoapRequestError);
          expect(err.causedBy).to.be.an.instanceof(Error);
        });
    });
    it('should throw SoapServerError when JSON received', () => {
      const request = requestJsonResponse(...serviceParams);
      return request({})
        .catch((err) => {
          expect(err).to.be.an.instanceof(RequestSoapError.SoapServerError);
        });
    });
    it('should log debug info', () => {
      sinon.spy(console, 'log');
      const request = requestJsonResponse(...serviceParams.concat(2));
      return request({})
        .catch(() => {
          expect(console.log).to.have.callCount(4);
        });
    });
  });
});
