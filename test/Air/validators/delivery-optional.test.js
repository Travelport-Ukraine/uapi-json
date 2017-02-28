import validate from '../../../src/Services/Air/validators/delivery-info-optional';

describe('Air.validators.phoneOptional', () => {
  it('should pass', () => {
    const deliveryInformation = {
      name: 123,
      street: 123,
      zip: 123,
      country: 123,
      city: 123,
    };
    validate({ deliveryInformation });
  });
});
