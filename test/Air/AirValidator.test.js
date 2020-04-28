const { expect } = require('chai');
const uAPI = require('../../src');
const AirValidator = require('../../src/Services/Air/AirValidator');

describe('#AirValidator', () => {
  describe('getTicket', () => {
    it('should fail if no params specified', () => {
      const fn = () => AirValidator.AIR_GET_TICKET();
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.ParamsMissing);
    });
    it('should fail if wrong params provided', () => {
      const fn = () => AirValidator.AIR_GET_TICKET('PARAMS');
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.ParamsInvalidType);
    });
    it('should fail if no ticket number provided', () => {
      const fn = () => AirValidator.AIR_GET_TICKET({});
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.TicketNumberMissing);
    });
    it('should fail if wrong ticket number provided', () => {
      const fn = () => AirValidator.AIR_GET_TICKET({ ticketNumber: 'NUMBER' });
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.TicketNumberInvalid);
    });
    it('should be ok when ticket number provided', () => {
      const fn = () => AirValidator.AIR_GET_TICKET({ ticketNumber: '1234567890123' });
      expect(fn).not.to.throw(Error);
    });
  });
  describe('ticketing', () => {
    it('should fail if no params specified', () => {
      const fn = () => AirValidator.AIR_TICKET();
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.ParamsMissing);
    });
    it('should fail if wrong params provided', () => {
      const fn = () => AirValidator.AIR_TICKET('PARAMS');
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.ParamsInvalidType);
    });
    it('should fail if no pnr provided', () => {
      const fn = () => AirValidator.AIR_TICKET({});
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.PnrMissing);
    });
    it('should fail if fop missing', () => {
      const fn = () => AirValidator.AIR_TICKET({ pnr: 'PNR000' });
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.FopMissing);
    });
    it('should fail if fop is not object', () => {
      const fn = () => AirValidator.AIR_TICKET({ pnr: 'PNR000', fop: 'UNSOPPERTED_STRING' });
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.FopTypeUnsupported);
    });
    it('should fail if fop type is not supported', () => {
      const fn = () => AirValidator.AIR_TICKET({ pnr: 'PNR000', fop: { type: 'Mastercard' } });
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.FopTypeUnsupported);
    });
    it('should be ok when fop is supported', () => {
      const fn = () => AirValidator.AIR_TICKET({ pnr: 'PNR000', fop: { type: 'Cash' } });
      expect(fn).not.to.throw(Error);
    });
  });
  describe('addSegments', () => {
    it('should fail if pnr is not provided', () => {
      const fn = () => AirValidator.UNIVERSAL_RECORD_MODIFY();
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.PnrMissing);
    });
    it('should fail if version is not provided', () => {
      const fn = () => AirValidator.UNIVERSAL_RECORD_MODIFY({ pnr: 'PNR000' });
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.VersionMissing);
    });
    it('should fail if universalRecordLocator is not provided', () => {
      const fn = () => AirValidator.UNIVERSAL_RECORD_MODIFY({ pnr: 'PNR000', version: 2 });
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.UniversalRecordLocatorCode);
    });
    it('should fail if reservationLocator is not provided', () => {
      const fn = () => AirValidator.UNIVERSAL_RECORD_MODIFY({
        pnr: 'PNR000',
        version: 2,
        universalRecordLocatorCode: 'UR_LOCATOR_CODE',
      });
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.reservationLocatorCode);
    });
    it('should fail if segments are incorrect', () => {
      const fn = () => AirValidator.UNIVERSAL_RECORD_MODIFY({
        pnr: 'PNR000',
        version: 2,
        universalRecordLocatorCode: 'UR_LOCATOR_CODE',
        reservationLocatorCode: 'RESERVATION_LOCATOR_CODE',
        segments: [{ from: 'FROM', to: 'TO' }],
      });
      expect(fn).to.throw(uAPI.errors.Air.AirValidationError.SegmentsMissing);
    });
  });
});
