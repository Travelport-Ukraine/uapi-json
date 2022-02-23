const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');
const validate = require('../../../src/Services/Air/validators/carriers');

const carriersTypes = ['permittedCarriers', 'preferredCarriers'];
const okCarriersList = ['LO', 'LH'];

describe('#Air#validators#carriers', () => {
  it('should throw when two types of carries are specified', () => {
    const params = {
      permittedCarriers: okCarriersList,
      preferredCarriers: okCarriersList,
    };
    try {
      validate(params);
      throw new Error('PASSED');
    } catch (err) {
      expect(err).to.be.an.instanceOf(AirValidationError.SingleCarriesTypeIsAllowed);
    }
  });
  it('should throw when carriers are invalid', () => {
    const carriers1 = 'NOT_AN_ARRAY';
    const carriers2 = [];
    const carriers3 = ['WRONG_CARRIER'];

    carriersTypes.forEach(
      (type) => {
        [carriers1, carriers2, carriers3].forEach(
          (carriers) => {
            expect(
              () => validate({ [type]: carriers })
            ).to.throw(AirValidationError.CarriersIsInvalid);
          }
        );
      }
    );
  });
  it('should not throw when carriers are OK', () => {
    carriersTypes.forEach(
      (type) => {
        expect(() => validate({ [type]: okCarriersList })).not.to.throw();
      }
    );
  });
});
