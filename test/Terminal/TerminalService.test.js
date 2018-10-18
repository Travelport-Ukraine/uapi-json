const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');
const createMock = require('../uapi-request.mock');
const auth = require('../testconfig');

describe('#TerminalService', () => {
  it('should test that all function created correctly', () => {
    const params = {
      auth,
      debug: 0,
      production: true,
    };
    const r = createMock(params);

    const createTerminalService = proxyquire('../../src/Services/Terminal/TerminalService', {
      '../../Request/uapi-request': r,
    });

    createTerminalService(params);
    expect(r.called).to.be.equal(true);
  });
});
