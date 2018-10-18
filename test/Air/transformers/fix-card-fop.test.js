const { expect } = require('chai');

const convert = require('../../../src/Services/Air/transformers/fix-card-fop');

const goodCC = {
  number: '5483969848297751',
  name: 'MASTERCARD',
  expDate: '01/25',
  cvv2: '123',
};

describe('Air.transformers.fixCardFop', () => {
  it('should change FOP to internal name, CC data to internal format', () => {
    const params = {
      fop: {
        type: 'Card',
      },
      creditCard: goodCC,
    };

    const converted = convert(params);
    expect(converted.fop.type).to.be.equal('Credit');
    expect(converted.creditCard.expDate).to.be.equal('2025-01');
  });

  it('should ignore if FOP is not Card', () => {
    const params = {
      fop: {
        type: 'Cash',
      },
    };

    const converted = convert(params);
    expect(converted.fop.type).to.be.equal('Cash');
  });
});
