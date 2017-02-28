import proxyquire from 'proxyquire';
import { expect } from 'chai';
import createMock from '../uapi-request.mock';

describe('#UtilsService', () => {
  it('should test that all function created correctly', () => {
    const params = {
      auth: {},
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
