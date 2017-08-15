import assert from 'assert';
import { expect } from 'chai';
import fs from 'fs';
import errors from '../../src/Services/Utils/UtilsErrors';
import { Parser as ParserUapi } from '../../src/Request/uapi-parser';
import utilsParser from '../../src/Services/Utils/UtilsParser';

const xmlFolder = `${__dirname}/../FakeResponses/Utils`;

describe('#utilsParser', () => {
  describe('currencyConvert()', () => {
    it('should parse single currency pair request', () => {
      const uParser = new ParserUapi('util:CurrencyConversionRsp', 'v_33_0', {});
      const parseFunction = utilsParser.CURRENCY_CONVERSION;
      const xml = fs.readFileSync(`${xmlFolder}/currency-conversion.single.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        expect(result).to.be.an('array').and.to.have.lengthOf(1);
        result.forEach(c => expect(c).to.be.an('object').and.to.have.all.keys(['from', 'to', 'rate']));
      });
    });

    it('should parse multi currency pair request', () => {
      const uParser = new ParserUapi('util:CurrencyConversionRsp', 'v_33_0', {});
      const parseFunction = utilsParser.CURRENCY_CONVERSION;
      const xml = fs.readFileSync(`${xmlFolder}/currency-conversion.multi.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        expect(result).to.be.an('array').and.to.have.lengthOf(2);
        result.forEach(c => expect(c).to.be.an('object').and.to.have.all.keys(['from', 'to', 'rate']));
      });
    });

    it('should throw parsing error', () => {
      const parseFunction = utilsParser.CURRENCY_CONVERSION;
      try {
        parseFunction({});
      } catch (e) {
        assert(e instanceof errors.UtilsParsingError, 'Incorrect error thrown');
      }
    });

    it('should test error handling', () => {
      const parseFunction = utilsParser.UTILS_ERROR;
      const uParser = new ParserUapi('util:CurrencyConversionRsp', 'v_33_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/../Other/UnableToFareQuoteError.xml`).toString(); // any error
      return uParser
        .parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          return parseFunction.call(uParser, errData);
        })
        .then(() => assert(false, 'Error should be thrown'))
        .catch(e => {
          assert(e instanceof errors.UtilsRuntimeError);
        });
    });
  });
});
