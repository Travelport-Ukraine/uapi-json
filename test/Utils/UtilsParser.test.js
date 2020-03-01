const assert = require('assert');
const { expect, should } = require('chai');
const fs = require('fs');
const uAPI = require('../../src');
const Parser = require('../../src/Request/uapi-parser');
const utilsParser = require('../../src/Services/Utils/UtilsParser');

const UtilsError = uAPI.errors.Utils;
const RequestError = uAPI.errors.Request;
const xmlFolder = `${__dirname}/../FakeResponses/Utils`;

describe('#utilsParser', () => {
  describe('currencyConvert()', () => {
    it('should parse single currency pair request', () => {
      const uParser = new Parser('util:CurrencyConversionRsp', 'v47_0', {});
      const parseFunction = utilsParser.CURRENCY_CONVERSION;
      const xml = fs.readFileSync(`${xmlFolder}/currency-conversion.single.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        expect(result).to.be.an('array').and.to.have.lengthOf(1);
        result.forEach(c => expect(c).to.be.an('object').and.to.have.all.keys(['from', 'to', 'rate']));
      });
    });

    it('should parse multi currency pair request', () => {
      const uParser = new Parser('util:CurrencyConversionRsp', 'v47_0', {});
      const parseFunction = utilsParser.CURRENCY_CONVERSION;
      const xml = fs.readFileSync(`${xmlFolder}/currency-conversion.multi.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        expect(result).to.be.an('array').and.to.have.lengthOf(2);
        result.forEach((c) => {
          expect(c).to.be.an('object').and.to.have.all.keys(['from', 'to', 'rate']);
          expect(c.rate).to.be.a('number');
        });
      });
    });

    it('should throw parsing error', () => {
      const parseFunction = utilsParser.CURRENCY_CONVERSION;
      try {
        parseFunction({});
      } catch (e) {
        assert(e instanceof UtilsError.UtilsParsingError, 'Incorrect error thrown');
        return;
      }
      should.fail('No error was thrown');
    });

    it('should test error handling', () => {
      const parseFunction = utilsParser.UTILS_ERROR;
      const uParser = new Parser('util:CurrencyConversionRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/../Other/UnableToFareQuoteError.xml`).toString(); // any error
      return uParser
        .parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          return parseFunction.call(uParser, errData);
        })
        .then(() => assert(false, 'Error should be thrown'))
        .catch((err) => {
          expect(err).to.be.an.instanceOf(RequestError.RequestRuntimeError.UnhandledError);
          expect(err.causedBy).to.be.an.instanceOf(UtilsError.UtilsRuntimeError);
        });
    });
  });
  describe('referenceData()', () => {
    it('should parse sample data response for Country', () => {
      const uParser = new Parser('util:ReferenceDataRetrieveRsp', 'v47_0', {});
      const parseFunction = utilsParser.REFERENCE_DATATYPE;
      const xml = fs.readFileSync(`${xmlFolder}/country-data.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        expect(result).to.be.an('array').and.to.have.lengthOf(3);
        result.forEach(c => expect(c).to.be.an('object').and.to.have.all.keys(['code', 'name', 'deprecated']));
      });
    });

    it('should parse sample data response for Hotel Amenities', () => {
      const uParser = new Parser('util:ReferenceDataRetrieveRsp', 'v47_0', {});
      const parseFunction = utilsParser.REFERENCE_DATATYPE;
      const xml = fs.readFileSync(`${xmlFolder}/hotelAmenities-data.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        expect(result).to.be.an('array').and.to.have.lengthOf(3);
        result.forEach(c => expect(c).to.be.an('object').and.to.have.all.keys(['code', 'name', 'description', 'deprecated', 'additionalInfo']));
      });
    });

    it('should parse sample data response for Payment Type', () => {
      const uParser = new Parser('util:ReferenceDataRetrieveRsp', 'v47_0', {});
      const parseFunction = utilsParser.REFERENCE_DATATYPE;
      const xml = fs.readFileSync(`${xmlFolder}/paymentType-data.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        expect(result).to.be.an('array').and.to.have.lengthOf(3);
        result.forEach(c => expect(c).to.be.an('object').and.to.have.all.keys(['code', 'name', 'description', 'deprecated', 'additionalInfo']));
      });
    });

    it('should throw parsing error', () => {
      const parseFunction = utilsParser.REFERENCE_DATATYPE;
      try {
        parseFunction({});
      } catch (e) {
        assert(e instanceof UtilsError.UtilsParsingError, 'Incorrect error thrown');
        return;
      }
      should.fail('No error was thrown');
    });

    it('should test error handling', () => {
      const parseFunction = utilsParser.UTILS_ERROR;
      const uParser = new Parser('util:ReferenceDataRetrieveRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/../Other/ReferenceDataError.xml`).toString(); // any error
      return uParser
        .parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          return parseFunction.call(uParser, errData);
        })
        .then(() => assert(false, 'Error should be thrown'))
        .catch((err) => {
          expect(err).to.be.an.instanceOf(RequestError.RequestRuntimeError.UnhandledError);
          expect(err.causedBy).to.be.an.instanceOf(UtilsError.UtilsRuntimeError);
        });
    });

    it('should test error handling', () => {
      const parseFunction = utilsParser.UTILS_ERROR;
      const uParser = new Parser('SOAP:Fault', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/../Other/ReferenceDataError.xml`).toString(); // any error
      return uParser
        .parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          return parseFunction.call(uParser, errData);
        })
        .then(() => assert(false, 'Error should be thrown'))
        .catch((err) => {
          expect(err).to.be.an.instanceOf(RequestError.RequestRuntimeError.UnhandledError);
          expect(err.causedBy).to.be.an.instanceOf(UtilsError.UtilsRuntimeError);
        });
    });
  });
});
