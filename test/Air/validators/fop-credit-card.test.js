const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const validate = require('../../../src/Services/Air/validators/fop-credit-card');

const goodCC = {
  number: '5483969848297751',
  name: 'MASTERCARD',
  expDate: '01/25',
  cvv2: '123',
};

const badCC = {
  number: '5400000000000000',
  name: 'BAD MASTERCARD',
  expDate: '01/25',
  cvv2: '123',
};

const goodCCNoCvv = {
  number: '5483969848297751',
  name: 'MASTERCARD',
  expDate: '01/25',
};

const goodCCBadType = {
  number: '5483969848297751',
  name: 'MASTERCARD',
  expDate: '01/25',
  cvv2: '123',
  type: 'XX',
};

describe('Air.validators.fopCreditCard', () => {
  it('should ignore when FOP is Cash', () => {
    const params = { fop: { type: 'Cash' } };
    const fn = () => validate(params);
    expect(fn).to.not.throw(Error);
  });

  it('should throw error when card data is missing', () => {
    const params = { fop: { type: 'Card' } };
    const fn = () => validate(params);
    expect(fn).to.throw(AirValidationError.CreditCardMissing);
  });

  it('should not throw error when correct Luhn', () => {
    const params = {
      fop: { type: 'Card' },
      creditCard: goodCC,
    };
    const fn = () => validate(params);
    expect(fn).not.to.throw(AirValidationError.CreditCardMissing);
  });

  it('should throw error when incorrect Luhn', () => {
    const params = {
      fop: { type: 'Card' },
      creditCard: badCC,
    };
    const fn = () => validate(params);
    expect(fn).to.throw(AirValidationError.CreditCardMissing);
  });

  it('should throw error when cvv missing', () => {
    const params = {
      fop: { type: 'Card' },
      creditCard: goodCCNoCvv,
    };
    const fn = () => validate(params);
    expect(fn).to.throw(AirValidationError.CreditCardMissing);
  });

  it('should throw error when CC type is not one of 1G types', () => {
    const params = {
      fop: { type: 'Card' },
      creditCard: goodCCBadType,
    };
    const fn = () => validate(params);
    expect(fn).to.throw(AirValidationError.CreditCardMissing);
  });

  it('should not leak CC data into exception', () => {
    const params = {
      fop: { type: 'Card' },
      creditCard: goodCCNoCvv,
    };
    const fn = () => validate(params);
    expect(fn).to.throw(AirValidationError.CreditCardMissing);

    try {
      fn();
    } catch (err) {
      expect(err.toString()).not.to.contain(goodCC.number);
    }
    expect('some text, ' + goodCC.number + '-bla-bla').to.contain(goodCC.number);
  });
});
