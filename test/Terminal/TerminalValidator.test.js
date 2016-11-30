/*
  eslint-disable import/no-extraneous-dependencies
*/
import { expect } from 'chai';
import uAPI from '../../src';
import TerminalValidator from '../../src/Services/Terminal/TerminalValidator';

describe('#TerminalValidator', () => {
  describe('createSession', () => {
    it('should fail if no params specified', () => {
      const fn = () => TerminalValidator.CREATE_SESSION();
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.ParamsMissing);
    });
    it('should fail if wrong params provided', () => {
      const fn = () => TerminalValidator.CREATE_SESSION('PARAMS');
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.ParamsInvalidType);
    });
    it('should fail when no timeout provided in params', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ SOME: 'PARAMS' });
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.SessionTimeoutInvalid);
    });
    it('should be ok when timeout = false provided in params', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ timeout: false });
      expect(fn).not.to.throw(Error);
    });
    it('should fail when wrong timeout type is provided', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ timeout: 'TIMEOUT' });
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.SessionTimeoutInvalid);
    });
    it('should fail when timeout is too low', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ timeout: 0 });
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.SessionTimeoutTooLow);
    });
    it('should be ok when timeout is ok', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ timeout: 300 });
      expect(fn).not.to.throw(Error);
    });
  });
  describe('executeCommand', () => {
    it('should fail if no params specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST();
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.ParamsMissing);
    });
    it('should fail if wrong params type specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST('PARAMS');
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.ParamsInvalidType);
    });
    it('should fail if no token specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST({});
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.SessionTokenMissing);
    });
    it('should fail if no command specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST({ sessionToken: 'TOKEN' });
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.CommandMissing);
    });
    it('should be ok when command and token are specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST({ sessionToken: 'TOKEN', command: 'I' });
      expect(fn).not.to.throw(Error);
    });
  });
  describe('closeSession', () => {
    it('should fail if no params specified', () => {
      const fn = () => TerminalValidator.CLOSE_SESSION();
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.ParamsMissing);
    });
    it('should fail if wrong params type specified', () => {
      const fn = () => TerminalValidator.CLOSE_SESSION('PARAMS');
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.ParamsInvalidType);
    });
    it('should fail if no token specified', () => {
      const fn = () => TerminalValidator.CLOSE_SESSION({});
      expect(fn).to.throw(uAPI.errors.Terminal.TerminalValidationError.SessionTokenMissing);
    });
    it('should be ok when token is specified', () => {
      const fn = () => TerminalValidator.CLOSE_SESSION({ sessionToken: 'TOKEN' });
      expect(fn).not.to.throw(Error);
    });
  });
});
