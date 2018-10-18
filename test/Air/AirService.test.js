const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');
const createMock = require('../uapi-request.mock');
const auth = require('../testconfig');

describe('#AirService', () => {
  it('should test that all function created correctly', () => {
    const params = {
      auth,
      debug: 0,
      production: true,
    };
    const requestMock = createMock(params);

    const createAirService = proxyquire('../../src/Services/Air/AirService', {
      '../../Request/uapi-request': requestMock,
    });

    createAirService(params);
    expect(requestMock.called).to.be.equal(true);
  });
});
