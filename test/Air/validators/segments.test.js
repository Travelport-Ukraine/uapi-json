import validate from '../../../src/Services/Air/validators/delivery-info-optional';

describe('Air.validators.phoneOptional', () => {
  it('should pass', () => {
    const deliveryInformation = {
      arrival: '123',
      departure: '123',
      from: 123,
      to: 123,
      airline: 123,
      flightNumber: 123,
      plane: 123,
    };
    validate({ deliveryInformation });
  });
});
