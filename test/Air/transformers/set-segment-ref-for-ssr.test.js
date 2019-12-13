const { expect } = require('chai');

const { setSegmentRefForSSR } = require('../../../src/Services/Air/transformers');

describe('Air.transformers.setsSegmentRefForSSR', () => {
  it('should set segmentRef from segment index', () => {
    const params = {
      'air:AirSegment': {
        'DummySegmentRefA===': { Key: 'DummySegmentRefA===' },
        'DummySegmentRefB===': { Key: 'DummySegmentRefB===' },
      },
      passengers: [
        {
          ssr: [
            { type: 'FQTV', segment: 0 },
            { type: 'FQTV', segment: 1 },
          ]
        },
      ],
    };
    const converted = setSegmentRefForSSR(params);

    expect(converted.passengers[0].ssr[0].segmentRef).to.be.equal('DummySegmentRefA===');
    expect(converted.passengers[0].ssr[1].segmentRef).to.be.equal('DummySegmentRefB===');
  });
});
