const { expect } = require('chai');
const { AirFlightInfoValidationError } = require('../../../src/Services/Air/AirErrors');

const flightInfo = require('../../../src/Services/Air/validators/flight-info');
const validateItem = require('../../../src/Services/Air/validators/utils/validate-flight-info-item');

describe('Air.validators.flightInfo', () => {
  it('sould throw error when airline missing', () => {
    const params = {};
    const fn = () => validateItem(params);
    expect(fn).to.throw(AirFlightInfoValidationError.AirlineMissing);
  });

  it('sould throw error when airline missing', () => {
    const params = { airline: 123 };
    const fn = () => validateItem(params);
    expect(fn).to.throw(AirFlightInfoValidationError.flightNumber);
  });

  it('sould throw error when airline missing', () => {
    const params = { airline: 123, flightNumber: 777 };
    const fn = () => validateItem(params);
    expect(fn).to.throw(AirFlightInfoValidationError.DepartureMissing);
  });

  it('sould pass', () => {
    const params = { airline: 123, flightNumber: 777, departure: 123 };
    const fn = () => validateItem(params);
    expect(fn).to.not.throw(Error);
  });

  it('should validate object', () => {
    const params = { airline: 123, flightNumber: 777, departure: 123 };
    const fn = () => flightInfo({ flightInfoCriteria: params });
    expect(fn).to.not.throw(Error);
  });

  it('should validate array', () => {
    const params = [
      { airline: 123, flightNumber: 777, departure: 123 },
      { airline: 123, flightNumber: 777, departure: 123 },
    ];
    const fn = () => flightInfo({ flightInfoCriteria: params });
    expect(fn).to.not.throw(Error);
  });
});
