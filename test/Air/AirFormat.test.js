import { expect } from 'chai';
import uAPI from '../../src';
import AirFormat from '../../src/Services/Air/AirFormat';

describe('#AirFormat', () => {
  describe('.getBaggage()', () => {
    it('should work when object is null and undefined', () => {
      const parsed = AirFormat.getBaggage({}, null);
      expect(parsed.length).to.be.equal(1);
      const [ first ] = parsed;
      expect(first.amount).to.be.equal(0);
      expect(first.units).to.be.equal('piece');
    });

    it('should concat results with existing baggage', () => {
      const parsed = AirFormat.getBaggage({ baggage: [{}] }, null);
      expect(parsed.length).to.be.equal(2);
    });

    it('should concat results with existing baggage', () => {
      const parsed = AirFormat.getBaggage({ baggage: [{}] }, null);
      expect(parsed.length).to.be.equal(2);
    });

    it('should correctly parse air:NumberOfPieces', () => {
      const parsed = AirFormat.getBaggage(
        null,
        { 'air:NumberOfPieces': 10 }
      );
      expect(parsed.length).to.be.equal(1);
      const [ first ] = parsed;
      expect(first.amount).to.be.equal(10);
      expect(first.units).to.be.equal('piece');
    });

    it('should correctly parse air:MaxWeight', () => {
      const parsed = AirFormat.getBaggage(
        null,
        { 'air:MaxWeight': { Unit: 'kg', Value: 10 } }
      );
      expect(parsed.length).to.be.equal(1);
      const [ first ] = parsed;
      expect(first.amount).to.be.equal(10);
      expect(first.units).to.be.equal('kg');
    });
  });
});
