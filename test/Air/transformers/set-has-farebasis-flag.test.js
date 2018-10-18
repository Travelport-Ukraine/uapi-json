const { expect } = require('chai');

const convert = require('../../../src/Services/Air/transformers/set-has-farebasis-flag');

describe('Air.trasnformers.setHasFareBasis', () => {
  it('should set flag = true', () => {
    const params = { segments: [{ fareBasisCode: '123' }] };
    const converted = convert(params);
    expect(converted.hasFareBasis).to.be.deep.equal(true);
  });

  it('should set flag = false', () => {
    const params = { segments: [{ fareBasisCode: null }] };
    const converted = convert(params);
    expect(converted.hasFareBasis).to.be.deep.equal(false);
  });

  it('should set flag = false 2', () => {
    const params = { segments: [{ }] };
    const converted = convert(params);
    expect(converted.hasFareBasis).to.be.deep.equal(false);
  });
});
