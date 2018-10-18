const { expect } = require('chai');
const { AirValidationError } = require('../../../src/Services/Air/AirErrors');

const connections = require('../../../src/Services/Air/validators/connections');

describe('Air.validators.connections', () => {
  it('should be ok without connections', () => {
    const fn = () => connections({
      randomStuff: {},
    });

    expect(fn).to.not.throw();
  });

  it('connections should be array', () => {
    const fn = () => connections({
      preferredConnectionPoints: {},
      permittedConnectionPoints: {},
      prohibitedConnectionPoints: {},
    });

    expect(fn).to.throw(AirValidationError.IncorrectConnectionsFormat);
  });

  it('connections should be IATA codes', () => {
    const fn = () => connections({
      preferredConnectionPoints: ['AMS'],
      permittedConnectionPoints: ['DME'],
      prohibitedConnectionPoints: ['KIEV'],
    });

    expect(fn).to.throw(AirValidationError.IncorrectConnectionsFormat);
  });
});
