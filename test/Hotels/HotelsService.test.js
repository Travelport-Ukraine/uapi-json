import proxyquire from 'proxyquire';
import { expect } from 'chai';
import createMock from '../uapi-request.mock';

describe('#HotelsService', () => {
  it('should test that all function created correctly', () => {
    const params = {
      auth: {},
      debug: 0,
      production: true,
    };
    const r = createMock(params);

    const createHotelsService = proxyquire('../../src/Services/Hotels/HotelsService', {
      '../../Request/uapi-request': r,
    });

    createHotelsService(params);
    expect(r.called).to.be.equal(true);
  });
});
