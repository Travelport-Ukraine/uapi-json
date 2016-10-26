const assert = require('assert');
const fs = require('fs');
const ParserUapi = require('../../src/Request/uapi-parser');
const utilsParser = require('../../src/Services/Utils/UtilsParser');

const xmlFolder = `${__dirname}/../FakeResponses/Utils`;

describe('#utilsParser', () => {

  describe('currencyConvert()', () => {
    it('give response object', () => {
      const uParser = new ParserUapi('util:CurrencyConversionRsp', 'v_33_0', {});
      const parseFunction = utilsParser.CURRENCY_CONVERSION;
      const xml = fs.readFileSync(`${xmlFolder}/CURRENCY_CONVERSION.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        assert.equal(result.length, 2, 'No Cancelled');
        result.map(c => {
          assert.notEqual(c.from, undefined, 'No from field');
          assert.notEqual(c.to, undefined, 'No to field');
          assert.notEqual(c.rate, undefined, 'No rate');
        });
      });
    });
  });
});
