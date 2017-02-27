import { expect } from 'chai';

import convert from '../../../src/Services/Air/transformers/set-groups-for-segments';

describe('Air.validators.setBusinessFlag', () => {
  it('should add two groups for segments', () => {
    const params = {
      segments: [
        { transfer: true },
        { transfer: false, },
        { transfer: true },
        { transfer: false },
      ],
    };
    const converted = convert(params);
    expect(converted.segments[0].Group).to.be.equal(0);
    expect(converted.segments[1].Group).to.be.equal(0);
    expect(converted.segments[2].Group).to.be.equal(1);
    expect(converted.segments[3].Group).to.be.equal(1);
  });
});

