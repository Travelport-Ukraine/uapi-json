import { expect } from 'chai';
import AirFormat from '../../src/Services/Air/AirFormat';

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
});
