const { expect } = require('chai');

const convert = require('../../../src/Services/Air/transformers/convert-passengers-object-to-array');


describe('Air.transformers.convertPassengersObjectToArray', () => {
  it('should correclty convert passengers', () => {
    const converted = convert({ passengers: { ADT: 1, CNN: 3, INF: 1 } });
    expect(converted).to.have.all.keys(['passengers']);
    converted.passengers.map((passenger) => {
      expect(passenger).to.have.all.keys(['ageCategory', 'child']);
      if (passenger.ageCategory === 'CNN') {
        expect(passenger.child).to.be.true;
      }

      return null;
    });
  });
});
