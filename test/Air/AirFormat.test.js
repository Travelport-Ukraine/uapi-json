const { expect } = require('chai');
const AirFormat = require('../../src/Services/Air/AirFormat');

describe('#AirFormat', () => {
  describe('.getBaggage()', () => {
    it('should work when object is null and undefined', () => {
      const parsed = AirFormat.getBaggage(null);
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(0);
      expect(parsed.units).to.be.equal('piece');
    });

    it('should correctly parse air:NumberOfPieces', () => {
      const parsed = AirFormat.getBaggage({ 'air:NumberOfPieces': 10 });
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(10);
      expect(parsed.units).to.be.equal('piece');
    });

    it('should correctly parse air:MaxWeight', () => {
      const parsed = AirFormat.getBaggage({ 'air:MaxWeight': { Unit: 'kg', Value: 10 } });
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(10);
      expect(parsed.units).to.be.equal('kg');
    });
  });
  describe('.getBaggageInfo()', () => {
    it('should work when object is null and undefined', () => {
      const parsed = AirFormat.getBaggageInfo(null);
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(0);
      expect(parsed.units).to.be.equal('piece');
    });

    const defaultValue = {
      'air:TextInfo': [
        '20K',
        'BAGGAGE DISCOUNTS MAY APPLY BASED ON FREQUENT FLYER STATUS/ ONLINE CHECKIN/FORM OF PAYMENT/MILITARY/ETC.',
      ],
      'air:BagDetails': [
        {
          ApplicableBags: '1stChecked',
          BasePrice: 'UAH1026',
          ApproximateBasePrice: 'UAH1026',
          TotalPrice: 'UAH1026',
          ApproximateTotalPrice: 'UAH1026',
          'air:BaggageRestriction': {
            'air:TextInfo': {
              'air:Text': 'UPTO50LB/23KG AND UPTO62LI/158LCM'
            }
          }
        },
      ]
    };

    it('should correctly parse air:TextInfo', () => {
      const parsed = AirFormat.getBaggageInfo(defaultValue);
      expect(parsed).to.be.an('object').and.to.have.keys([
        'amount', 'units',
        'detail',
      ]);
      expect(parsed.amount).to.be.equal('20');
      expect(parsed.units).to.be.equal('kilograms');
    });

    it('should correctly parse air:BagDetails', () => {
      const parsed = AirFormat.getBaggageInfo(defaultValue);
      expect(parsed).to.be.an('object').and.to.have.keys([
        'amount', 'units',
        'detail',
      ]);
      expect(parsed.detail[0].applicableBags).to.be.equal('1stChecked');
      expect(parsed.detail[0].basePrice).to.be.equal('UAH1026');
    });
  });
});
