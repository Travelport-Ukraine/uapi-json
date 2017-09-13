import proxyquire from 'proxyquire';
import { expect } from 'chai';
import createMock from '../uapi-request.mock';
import auth from '../testconfig';

describe('#HotelsService', () => {
  it('should test that all function created correctly', () => {
    const params = {
      auth,
      debug: 0,
      production: true,
    };
    const r = createMock(params);

    const createHotelService = proxyquire('../../src/Services/Hotels/HotelsService', {
      '../../Request/uapi-request': r,
    });

    createHotelService(params);
    expect(r.called).to.be.equal(true);
  });
});
