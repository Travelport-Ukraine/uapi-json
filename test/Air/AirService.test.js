import proxyquire from 'proxyquire';
import { expect } from 'chai';
import createMock from '../uapi-request.mock';
import auth from '../testconfig';

describe('#AirService', () => {
  it('should test that all function created correctly', () => {
    const params = {
      auth,
      debug: 0,
      production: true,
    };
    const r = createMock(params);

    const createAirService = proxyquire('../../src/Services/Air/AirService', {
      '../../Request/uapi-request': r,
    });

    createAirService(params);
    expect(r.called).to.be.equal(true);
  });
});
