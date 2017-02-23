import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { expect } from 'chai';
import fs from 'fs';

describe('#AirService', () => {
  it('should test that all function created correctly', () => {
    const params = {
      auth: {},
      debug: 0,
      production: true,
    };

    const r = sinon.spy(function(
      url,
      auth,
      template,
      root,
      validator,
      error,
      parser,
      debug
    ) {
      expect(url.match(/.*.pp.*/)).to.be.equal(null);
      expect(auth).to.be.equal(params.auth);
      expect(fs.existsSync(template)).to.be.equal(true);
      expect(validator).to.be.a('function');
      expect(parser).to.be.a('function');
      expect(error).to.be.a('function');
      expect(debug).to.be.equal(params.debug);
    });

    const createAirService = proxyquire('../../src/Services/Air/AirService', {
      '../../Request/uapi-request': r,
    });

    createAirService(params);
    expect(r.called).to.be.equal(true);
  });
});
