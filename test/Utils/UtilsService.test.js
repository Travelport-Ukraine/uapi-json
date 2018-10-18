const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');
const createMock = require('../uapi-request.mock');
const auth = require('../testconfig');

describe('#UtilsService', () => {
  it('should test that all function created correctly', () => {
    const params = {
      auth,
      debug: 0,
      production: true,
    };
    const r = createMock(params);

    const createUtilsService = proxyquire('../../src/Services/Utils/UtilsService', {
      '../../Request/uapi-request': r,
    });

    createUtilsService(params);
    expect(r.called).to.be.equal(true);
  });
});
