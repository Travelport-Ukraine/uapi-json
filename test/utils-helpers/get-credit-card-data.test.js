const { expect } = require('chai');
const getCreditCardData = require('../../src/utils/get-credit-card-data');

const correctCCData = {
  Type: 'CA',
  Number: '************4811',
  ExpDate: '2024-08',
  Name: 'kiwi kiwi'
};

const correctCCAuthData = {
  PaymentRef: 'iI0ftKc3nDKAyIfZmBAAAA==',
  Number: '************4811',
  Amount: 'PLN1164.72',
  AuthCode: '207692',
  AuthResultCode: 'approved',
  FormOfPaymentRef: 'jwt2mcK1Qp27I2xfpcCtAw=='
};

describe('#getCreditCardData', () => {
  it('should properly form credit card data', () => {
    expect(getCreditCardData(correctCCData, correctCCAuthData))
      .to.be.eq('CA************4811-207692');
  });

  it('should properly form credit card data without aprroval code', () => {
    expect(getCreditCardData(correctCCData, { ...correctCCAuthData, AuthResultCode: '' }))
      .to.be.eq('CA************4811');
  });

  it('should return CC only in case of empty data received', () => {
    expect(getCreditCardData())
      .to.be.eq('CC');
  });
});
