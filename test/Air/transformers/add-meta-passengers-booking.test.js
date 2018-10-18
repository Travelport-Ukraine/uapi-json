const { expect } = require('chai');
const moment = require('moment');

const convert = require('../../../src/Services/Air/transformers/add-meta-passengers-booking');
const age = require('../../../src/Services/Air/transformers/set-passengers-age');

describe('Air.transformers.setPassengersAge', () => {
  it('should add age', () => {
    const passengers = [{
      lastName: 'FIRST',
      firstName: 'PAX',
      passCountry: 'UA',
      passNumber: 'PASS1',
      birthDate: moment().subtract(40, 'years').format('YYYY-MM-DD'),
      gender: 'M',
      ageCategory: 'ADT',
    }, {
      lastName: 'SECOND',
      firstName: 'PAX',
      passCountry: 'UA',
      passNumber: 'PASS2',
      birthDate: moment().subtract(11, 'years').format('YYYY-MM-DD'),
      gender: 'M',
      ageCategory: 'CNN',
    }, {
      lastName: 'THIRD',
      firstName: 'PAX',
      passCountry: 'UA',
      passNumber: 'PASS3',
      birthDate: moment().subtract(5, 'years').format('YYYY-MM-DD'),
      gender: 'M',
      ageCategory: 'CNN',
    }];
    const params = { passengers };

    const converted = convert(age(params));
    expect(converted.passengers[0].DOB).to.be.equal(passengers[0].birthDate);
    expect(converted.passengers[1].DOB).to.be.equal(passengers[1].birthDate);
    expect(converted.passengers[1].isChild).to.be.equal(true);
    expect(converted.passengers[1].ageCategory).to.be.equal('C11');
    expect(converted.passengers[2].DOB).to.be.equal(passengers[2].birthDate);
    expect(converted.passengers[2].isChild).to.be.equal(true);
    expect(converted.passengers[2].ageCategory).to.be.equal('C05');
  });
});
