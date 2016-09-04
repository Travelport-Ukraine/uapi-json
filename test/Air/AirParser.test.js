var proxy  = require('proxyquire');
var sinon  = require('sinon');
var assert = require('assert');
var fs = require('fs');
var _ = require('lodash');

const ParserUapi = require('../../src/uapi-parser');
const xmlFolder = __dirname + '/../FakeResponses/Air';
describe('#AirParser', function () {
  describe('AIR_LOW_FARE_SEARCH()', () => {
    it('should test parsing of low fare search request', () => {
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v_33_0', {});
      const parseFunction = require('../../src/Air/AirParser').AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CDNIEVBKK.xml`).toString();

      return uParser.parse(xml).then(json => {
        const result = parseFunction.call(uParser, json);
        assert(result.length === 27, 'Length is not 27');
        assert(result[0].BasePrice, 'No base price.');
        assert(result[0].Taxes, 'No taxes.');
        assert(result[0].TotalPrice, 'No total price.');
        assert(result[0].Directions, 'No Directions.');
        assert(result[0].BookingComponents, 'No Booking components.');
        assert(result[0].Directions.length, 'Directions length not 2.');
        const directions = result[0].Directions;
        const first = directions[0][0];
        const second = directions[1][0];
        assert(directions[0].length == 1, 'From direction length shoudl be 1');
        assert(first.Segments, 'No segments in dir[0][0]');
        assert(second.Segments, 'No segments in dir[1][0]');

        assert(first.from, 'No from  in dir[0][0]');
        assert(first.to, 'No to  in dir[0][0]');
        assert(first.platingCarrier, 'No PC in dir[0][0]');
        const segment = first.Segments[0];
        assert(segment.arrival, 'Segement should have arrival');
        assert(segment.departure, 'Segement should have departure');
        assert(segment.bookingClass, 'Segement should have bookingClass');
        assert(segment.fareBasisCode, 'Segement should have fareBasisCode');
        assert(segment.from, 'Segement should have from');
        assert(segment.to, 'Segement should have to');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should compare xml with parsed json', () => {
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v_33_0', {});
      const parseFunction = require('../../src/Air/AirParser').AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CDNIEVBKK.xml`).toString();
      const jsonResult = require('../FakeResponses/Air/LowFaresSearch.2ADT1CDNIEVBKK.json');
      return uParser.parse(xml).then(json => {
        const result = parseFunction.call(uParser, json);
        assert(JSON.stringify(result) === JSON.stringify(jsonResult), 'Results are not equal.');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should compare xml with parsed json', () => {
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v_33_0', {});
      const parseFunction = require('../../src/Air/AirParser').AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.1ADTIEVPAR.xml`).toString();
      const jsonResult = require('../FakeResponses/Air/LowFaresSearch.1ADTIEVPAR.json');
      return uParser.parse(xml).then(json => {
        const result = parseFunction.call(uParser, json);
        assert(JSON.stringify(result) === JSON.stringify(jsonResult), 'Results are not equal.');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });
});
