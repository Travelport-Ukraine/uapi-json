const { expect } = require('chai');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AirFormat = require('../../src/Services/Air/AirFormat');
const Parser = require('../../src/Request/uapi-parser');

const xmlFolder = path.join(__dirname, '..', 'FakeResponses', 'Air');

describe('#AirFormat', () => {
  describe('.getBaggage()', () => {
    it('should work when object is null and undefined', () => {
      const parsed = AirFormat.getBaggage(null);
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(0);
      expect(parsed.units).to.be.equal('piece');
    });

    it('should correctly parse air:NumberOfPieces', () => {
      const parsed = AirFormat.getBaggage({ 'air:NumberOfPieces': 10 });
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(10);
      expect(parsed.units).to.be.equal('piece');
    });

    it('should correctly parse air:MaxWeight', () => {
      const parsed = AirFormat.getBaggage({ 'air:MaxWeight': { Unit: 'kg', Value: 10 } });
      expect(parsed).to.be.an('object').and.to.have.all.keys([
        'amount', 'units',
      ]);
      expect(parsed.amount).to.be.equal(10);
      expect(parsed.units).to.be.equal('kg');
    });
  });

  describe('.formatLowFaresSearch()', () => {
    it('should return list of fares without faresOnly param', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = AirFormat.formatLowFaresSearch({
          provider: '1G',
        }, json);

        expect(result).to.be.an('array').and.to.have.length.above(0);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should return an object with fares with faresOnly=false', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = AirFormat.formatLowFaresSearch({
          provider: '1G',
          faresOnly: false,
        }, json);

        expect(result).to.be.an('object');
        expect(result).to.have.all.keys('transactionId', 'fares');
        expect(result.transactionId).to.be.equal('EA12C12B0A0759C12225F702ADCB99E9');
        expect(result.fares).to.be.an('array').and.to.have.length(27);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should return an object with fares with faresOnly=false in asynch results', () => {
      const uParser = new Parser('air:LowFareSearchAsynchRsp', 'v47_0', {});
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearchAsync.1ADTICNKKJ.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = AirFormat.formatLowFaresSearch({
          provider: '1G',
          faresOnly: false,
        }, json);

        expect(result).to.be.an('object');
        expect(result).to.have.any.keys('transactionId', 'searchId', 'providerCode', 'hasMoreResults', 'fares');
        expect(result.transactionId).to.be.equal('A93F11A30A076478EAD0520D3E91FDC7');
        expect(result.searchId).to.be.equal('A93F11A30A076478EAD0520D3E91FDC7_OICNKKJ20Oct19Economyfnull-1f-1-1tftnull300-1-1MI1GnullfADTKRWnullnullnullnullnullnullnullnullnullfff2124774');
        expect(result.providerCode).to.be.equal('1G');
        expect(result.fares).to.be.an('array').and.to.have.length(13);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });
});
