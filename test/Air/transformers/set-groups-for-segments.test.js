const { expect } = require('chai');

const convert = require('../../../src/Services/Air/transformers/set-groups-for-segments');

describe('Air.transformers.setGroupsForSegments', () => {
  it('should add transfer info for segments', () => {
    const params = {
      segments: [
        { group: 0 },
        { group: 0 },
        { group: 1 },
        { group: 2 },
      ],
    };
    const converted = convert(params);
    expect(converted.segments[0].transfer).to.be.equal(true);
    expect(converted.segments[1].transfer).to.be.equal(false);
    expect(converted.segments[2].transfer).to.be.equal(false);
    expect(converted.segments[3].transfer).to.be.equal(false);
  });
});
