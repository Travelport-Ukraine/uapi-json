import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

import utils from '../src/utils';

describe('#Utils', () => {
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

    describe('.searchPaxList', () => {
      it('should test for correct parsing', () => {
        const file = getFile('searchPaxList');
        const parsed = utils.parsers.searchPaxList(file);
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

      it('should return null if not parsed', () => {
        const screen = 'some string';
        const parsed = utils.parsers.searchPaxList(screen);
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
  });
});
