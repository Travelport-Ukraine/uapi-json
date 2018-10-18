const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');

const errors = require('../src/error-types');
const utils = require('../src/utils');

describe('#Utils', () => {
  describe('.getBookingFromUr', () => {
    it('should return undefined when ur array is empty', () => {
      expect(utils.getBookingFromUr([], 'PNR001')).to.equal(undefined);
    });
    it('should return undefined when ur array does not contain needed pnr', () => {
      expect(utils.getBookingFromUr([{ pnr: 'PNR002' }], 'PNR001')).to.equal(undefined);
    });
    it('should return undefined when ur array does not contain needed pnr', () => {
      const x = utils.getBookingFromUr([{ pnr: 'PNR001' }], 'PNR001');
      expect(x).to.be.an('object');
      expect(x.pnr).to.equal('PNR001');
    });
  });
  describe('.price', () => {
    it('should return test that price return null is not string', () => {
      expect(utils.price(undefined)).equal(null);
      expect(utils.price(null)).equal(null);
    });

    it('should correct parse price', () => {
      const parsed = utils.price('UAH123');
      expect(parsed.currency).equal('UAH');
      expect(parsed.value).equal(123);
    });
  });

  describe('.beautifyName', () => {
    it('should beautify name and make it first letter uppercase', () => {
      const p = utils.beautifyName('hello world my name');
      expect(p).equal('Hello World My Name');
    });

    it('should not crash on null', () => {
      const p = utils.beautifyName(null);
      expect(p).equal(null);
    });
  });

  describe('.firstInObj', () => {
    it('should return first value of object', () => {
      const first = utils.firstInObj({ a: 1, b: 2 });
      expect(first).equal(1);
    });

    it('should not crash on undefined', () => {
      const p = utils.beautifyName(undefined);
      expect(p).equal(null);
    });
  });

  describe('.renameProperty', () => {
    it('should return same object on same props change', () => {
      const obj = { a: 1 };
      const res = utils.renameProperty(obj, 'a', 'a');
      expect(res).to.deep.equal(obj);
    });

    it('should not correct rename property', () => {
      const obj = { a: 1 };
      const res = utils.renameProperty(obj, 'a', 'b');
      expect(res).to.deep.equal({ b: 1 });
    });
  });

  describe('.validate', () => {
    it('should check if all functions are called', () => {
      const f1 = sinon.spy(() => {});
      const f2 = sinon.spy(() => {});
      const f3 = sinon.spy(() => {});

      const validate = utils.validate(f1, f2, f3);
      const params = { foo: '123', bar: 123 };
      const res = validate(params);

      expect(res).to.deep.equal(params);
      expect(f1.calledOnce).to.be.equal(true);
      expect(f2.calledOnce).to.be.equal(true);
      expect(f3.calledOnce).to.be.equal(true);
    });

    it('should check if error is not missing', () => {
      const f1 = sinon.spy(() => { throw new Error('Error'); });

      const validate = utils.validate(f1);
      const params = { foo: '123', bar: 123 };
      try {
        validate(params);
      } catch (e) {
        expect(e instanceof Error).to.be.equal(true);
        expect(e.message).to.be.equal('Error');
      }

      expect(f1.calledOnce).to.be.equal(true);
    });

    it('should work well without any params', () => {
      const validate = utils.validate();
      const params = { foo: '123', bar: 123 };
      const res = validate(params);
      expect(res).to.deep.equal(params);
    });
  });

  describe('.transform', () => {
    it('should transform data and dont mutate input', () => {
      const params = { me: 'you' };
      const t1 = sinon.spy((innerParams) => { innerParams.me = 'me'; return innerParams; });
      const transform = utils.transform(t1);
      return transform(params).then((res) => {
        expect(params).to.be.not.deep.equal(res);
        expect(params).to.not.be.equal(res);
        expect(res.me).to.be.equal('me');
        expect(t1.calledOnce).to.be.true;
      });
    });

    it('should correctly work without any transformers', () => {
      const params = { me: 'you' };
      const transform = utils.transform();
      return transform(params).then((res) => {
        expect(params).to.be.deep.equal(res);
        expect(params).to.not.be.equal(res);
      });
    });
  });

  describe('.compose', () => {
    it('should compose two functions', () => {
      const add1 = a => a + 1;
      const mul2 = a => a * 2;

      const addMul = utils.compose(add1, mul2);
      const res = addMul(5);
      expect(res).to.be.equal(12);
    });
  });

  describe('#parsers', () => {
    const getFile = (name) => {
      const screen = path.join(
        __dirname,
        `./FakeResponses/Terminal/${name}.txt`
      );

      const file = fs
        .readFileSync(screen)
        .toString();
      return file;
    };

    describe('.serviceSegment', () => {
      const testStrings = [
        '-D/993/CHANGE FEE/NM-1KOT/ANNA//100/UAH',
      ];

      testStrings.forEach((str) => {
        const parsed = utils.parsers.serviceSegment(str);
        expect(parsed.rfiCode).to.match(/^[A-Z]$/);
        expect(parsed.rfiSubcode).to.match(/^[0-9A-Z]{3}$/);
        expect(parsed.rfiSubcode).to.match(/^[0-9A-Z]{3}$/);
        expect(parsed.feeDescription).to.be.a('string');
        expect(parsed.name).to.match(/^[A-Z]+\/[A-Z]+$/);
        expect(parsed.amount).to.be.a('number');
        expect(parsed.currency).to.match(/^[A-Z]{3}$/);
      });
    });

    describe('.searchPassengersList', () => {
      it('should test for correct parsing', () => {
        const file = getFile('searchPassengersList');
        const parsed = utils.parsers.searchPassengersList(file);
        expect(parsed.length).to.be.equal(22);
        const count = parsed.reduce((acc, x) => acc + Number(x.isCancelled), 0);
        expect(count).to.be.equal(16);
        parsed.forEach((line) => {
          expect(line).to.have.all.keys(
            'id',
            'firstName',
            'lastName',
            'isCancelled',
            'date'
          );
        });
      });

      it('should test for correct parse empty list', () => {
        const file = getFile('searchPassengersList_empty');
        const parsed = utils.parsers.searchPassengersList(file);
        expect(parsed.length).to.be.equal(0);
      });

      it('should return null if not parsed', () => {
        const screen = 'some string';
        const parsed = utils.parsers.searchPassengersList(screen);
        expect(parsed).to.be.equal(null);
      });
    });

    describe('.bookingPnr', () => {
      it('should return pnr for booking screen', () => {
        const file = getFile('bookingInUse');
        const parsed = utils.parsers.bookingPnr(file);
        expect(parsed).to.be.equal('KSD38G');
      });

      it('should return pnr for booking screen', () => {
        const file = getFile('bookingInUse2');
        const parsed = utils.parsers.bookingPnr(file);
        expect(parsed).to.be.equal('KS2814');
      });

      it('should return null if cannot parse', () => {
        expect(utils.parsers.bookingPnr('sdad')).to.be.equal(null);
      });
    });

    describe('.hasAllFields', () => {
      it('should pass', () => {
        const fields = ['foo', 'bar'];
        const object = { foo: 123, bar: 456 };
        const fn = () => utils.hasAllFields(object, fields, Error);
        expect(fn).to.not.throw(Error);
      });

      it('should throw error', () => {
        const fields = ['foo', 'bar'];
        const object = { foo: 456 };
        const fn = () => utils.hasAllFields(object, fields);
        try {
          fn();
        } catch (e) {
          expect(e instanceof errors.ValidationError).to.be.equal(true);
          expect(e.data.required).to.be.deep.equal(['foo', 'bar']);
          expect(e.data.missing).to.be.deep.equal('bar');
          return;
        }
        throw Error('Should throw an Error');
      });
    });

    describe('.inflate/.deflate', () => {
      it('should return string same before and after', () => {
        const original = 'somestring';
        return utils.deflate(original).then(utils.inflate).then((res) => {
          expect(res).to.be.equal(original);
        });
      });

      it('should return error on incorrect inflate', () => {
        const original = 'somestring';
        return utils.inflate(original).then(() => {
          throw new Error('Cant be response');
        }).catch((e) => {
          expect(e.message).not.equal('Cant be response');
        });
      });

      it('should return error if cant deflate', () => {
        const original = 123;
        return utils.deflate(original).then(() => {
          throw new Error('Cant be response');
        }).catch((e) => {
          expect(e.message).not.equal('Cant be response');
        });
      });
    });

    describe('.getErrorPcc', () => {
      it('should work with non null', () => {
        expect(utils.getErrorPcc()).to.be.a('null');
        expect(utils.getErrorPcc(null)).to.be.a('null');
      });

      it('should not break on any other string', () => {
        expect(utils.getErrorPcc('123')).to.equal(null);
      });

      it('should work with correct data', () => {
        expect(utils.getErrorPcc('NO AGREEMENT EXISTS FOR AGENCY - 38KP')).to.equal('38KP');
      });

      it('should also work with data', () => {
        expect(utils.getErrorPcc('NO AGREEMENT EXISTS FOR AGENCY -  0XF')).to.equal('0XF');
      });
    });
  });
});
