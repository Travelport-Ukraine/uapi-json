/*
  eslint-disable import/no-extraneous-dependencies
*/
const { expect } = require('chai');
const uAPI = require('../../src');
const TerminalValidator = require('../../src/Services/Terminal/TerminalValidator');

const TerminalError = uAPI.errors.Terminal;

describe('#TerminalValidator', () => {
  describe('createSession', () => {
    it('should fail if no params specified', () => {
      const fn = () => TerminalValidator.CREATE_SESSION();
      expect(fn).to.throw(TerminalError.TerminalValidationError.ParamsMissing);
    });
    it('should fail if wrong params provided', () => {
      const fn = () => TerminalValidator.CREATE_SESSION('PARAMS');
      expect(fn).to.throw(TerminalError.TerminalValidationError.ParamsInvalidType);
    });
    it('should fail when no timeout provided in params', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ SOME: 'PARAMS' });
      expect(fn).to.throw(TerminalError.TerminalValidationError.SessionTimeoutInvalid);
    });
    it('should be ok when timeout = false provided in params', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ timeout: false });
      expect(fn).not.to.throw(Error);
    });
    it('should fail when wrong timeout type is provided', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ timeout: 'TIMEOUT' });
      expect(fn).to.throw(TerminalError.TerminalValidationError.SessionTimeoutInvalid);
    });
    it('should fail when timeout is too low', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ timeout: 0 });
      expect(fn).to.throw(TerminalError.TerminalValidationError.SessionTimeoutTooLow);
    });
    it('should be ok when timeout is ok', () => {
      const fn = () => TerminalValidator.CREATE_SESSION({ timeout: 300 });
      expect(fn).not.to.throw(Error);
    });
  });
  describe('executeCommand', () => {
    it('should fail if no params specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST();
      expect(fn).to.throw(TerminalError.TerminalValidationError.ParamsMissing);
    });
    it('should fail if wrong params type specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST('PARAMS');
      expect(fn).to.throw(TerminalError.TerminalValidationError.ParamsInvalidType);
    });
    it('should fail if no token specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST({});
      expect(fn).to.throw(TerminalError.TerminalValidationError.SessionTokenMissing);
    });
    it('should fail if wrong token type specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST({ sessionToken: 123456789 });
      expect(fn).to.throw(TerminalError.TerminalValidationError.SessionTokenInvalid);
    });
    it('should fail if no command specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST({ sessionToken: 'TOKEN' });
      expect(fn).to.throw(TerminalError.TerminalValidationError.CommandMissing);
    });
    it('should fail if wrong command type specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST({ sessionToken: 'TOKEN', command: { command: 'CAME AS OBJECT' } });
      expect(fn).to.throw(TerminalError.TerminalValidationError.CommandInvalid);
    });
    it('should be ok when command and token are specified', () => {
      const fn = () => TerminalValidator.TERMINAL_REQUEST({ sessionToken: 'TOKEN', command: 'I' });
      expect(fn).not.to.throw(Error);
    });
  });
  describe('closeSession', () => {
    it('should fail if no params specified', () => {
      const fn = () => TerminalValidator.CLOSE_SESSION();
      expect(fn).to.throw(TerminalError.TerminalValidationError.ParamsMissing);
    });
    it('should fail if wrong params type specified', () => {
      const fn = () => TerminalValidator.CLOSE_SESSION('PARAMS');
      expect(fn).to.throw(TerminalError.TerminalValidationError.ParamsInvalidType);
    });
    it('should fail if no token specified', () => {
      const fn = () => TerminalValidator.CLOSE_SESSION({});
      expect(fn).to.throw(TerminalError.TerminalValidationError.SessionTokenMissing);
    });
    it('should be ok when token is specified', () => {
      const fn = () => TerminalValidator.CLOSE_SESSION({ sessionToken: 'TOKEN' });
      expect(fn).not.to.throw(Error);
    });
  });
});
