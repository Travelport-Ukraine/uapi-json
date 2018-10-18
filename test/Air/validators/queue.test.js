const { expect } = require('chai');
const { GdsValidationError } = require('../../../src/Services/Air/AirErrors');

const queue = require('../../../src/Services/Air/validators/queue');

describe('Air.validators.queue', () => {
  it('should throw error when queue is not set', () => {
    const fn = () => queue({});
    expect(fn).to.throw(GdsValidationError.QueueMissing);
  });

  it('should pass', () => {
    const fn = () => queue({ queue: '123' });
    expect(fn).to.not.throw(Error);
  });
});
