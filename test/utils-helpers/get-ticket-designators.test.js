const { expect } = require('chai');
const formFareBasisCode = require('../../src/utils/form-fare-basis-code');

const fareInfo = {
  '2hfKH9zxnDKAY9O4GjAAAA==': {
    Origin: 'IST',
    Destination: 'PRG',
    EffectiveDate: '2022-03-17T00:00:00.000+01:00',
    NotValidBefore: '2022-06-01',
    NotValidAfter: '2022-06-01',
    FareBasis: 'ECOORP7YCH',
  }
};

const airPricingInfo = {
  'air:FareInfo': {
    '2hfKH9zxnDKAV9O4GjAAAA==': {
      Origin: 'SGN',
      Destination: 'IST',
      EffectiveDate: '2022-03-17T00:00:00.000+01:00',
      NotValidBefore: '2022-05-31',
      NotValidAfter: '2022-05-31',
      FareBasis: 'ECOORP7YCH',
    },
  },
  FareCalculationInd: 'B'
};

const coupon = {
  Key: '+EO2VCTynDKAtbozoTAAAA==',
  MarketingFlightNumber: '163',
  Origin: 'IST',
  Destination: 'PRG',
  FareBasis: 'ECOORP1C',
};

describe('#formFareBasisCode', () => {
  it('should properly form fare basis code with coupon designator', () => {
    expect(formFareBasisCode(null, {
      ...coupon,
      'air:TicketDesignator': {
        Value: 'FS10'
      },
    })).to.be.eq('ECOORP1C/FS10');
  });

  it('should properly form fare basis code with fare ticket designator', () => {
    expect(formFareBasisCode({
      'air:FareInfo': {
        ...airPricingInfo['air:FareInfo'],
        '2hfKH9zxnDKAY9O4GjAAAA==': {
          ...fareInfo['2hfKH9zxnDKAY9O4GjAAAA=='],
          'air:FareTicketDesignator': '/FS11',
        }
      }
    }, coupon)).to.be.eq('ECOORP7YCH/FS11');
  });

  it('should properly form basis code with no ticket designators', () => {
    expect(formFareBasisCode({
      'air:FareInfo': {
        ...airPricingInfo['air:FareInfo'],
        ...fareInfo,
      }
    }, coupon)).to.be.eq('ECOORP7YCH');
  });
});
