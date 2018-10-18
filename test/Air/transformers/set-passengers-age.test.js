const { expect } = require('chai');
const moment = require('moment');

const convert = require('../../../src/Services/Air/transformers/set-passengers-age');

describe('Air.transformers.setPassengersAge', () => {
  it('should add age of passsengers', () => {
    const ages = [48, 47, 10, 5, 1];
    const checkAges = ages.concat([]);
    const params = {
      passengers: [
        { birthDate: moment().subtract(ages.pop(), 'years').format('YYYY-MM-DD') },
        { birthDate: moment().subtract(ages.pop(), 'years').format('YYYY-MM-DD') },
        { birthDate: moment().subtract(ages.pop(), 'years').format('YYYY-MM-DD') },
        { birthDate: moment().subtract(ages.pop(), 'years').format('YYYY-MM-DD') },
        { birthDate: moment().subtract(ages.pop(), 'years').format('YYYY-MM-DD') },
      ],
    };
    const converted = convert(params);
    converted.passengers.forEach((passenger) => {
      expect(passenger.Age).to.be.equal(checkAges.pop());
    });
  });
});
