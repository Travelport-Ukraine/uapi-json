import { expect } from 'chai';

import convert from '../../../src/Services/Air/transformers/set-business-flag';

describe('Air.validators.setBusinessFlag', () => {
  it('should not modify params', () => {
    const params = { segments: [{ serviceClass: 'Economy' }] };
    const converted = convert(params);
    expect(converted).to.be.deep.equal(params);
  });

  it('should add business flag', () => {
    const params = { segments: [{ serviceClass: 'Business' }] };
    const converted = convert(params);
    expect(converted.business).to.be.equal(true);
  });
});

