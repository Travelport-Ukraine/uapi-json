/*
  eslint-disable import/no-extraneous-dependencies
*/

import sinon from 'sinon';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import config from '../testconfig';
import uAPI from '../../src';

const TerminalError = uAPI.errors.Terminal;

// Token const
const token = 'TOKEN';

// Spied functions
const getSessionToken = sinon.spy(() => Promise.resolve(token));
const executeCommandSlow = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');
  switch (params.command) {
    case 'I':
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(['IGNORED']);
        }, 100);
      });
    default:
      if (params.command.match(/^SEM/)) {
        return Promise.resolve(['PROCEED']);
      }
      return Promise.resolve(['ERR']);
  }
});
const executeCommandOk = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');
  switch (params.command) {
    case 'I':
      return Promise.resolve(['IGNORED']);
    default:
      if (params.command.match(/^SEM/)) {
        return Promise.resolve(['PROCEED']);
      }
      return Promise.resolve(['ERR']);
  }
});
const executeCommandEmulationFailed = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');
  switch (params.command) {
    case 'I':
      return Promise.resolve(['IGNORED']);
    default:
      if (params.command.match(/^SEM/)) {
        return Promise.resolve(['RESTRICTED']);
      }
      return Promise.resolve(['ERR']);
  }
});
const closeSession = sinon.spy(() => Promise.resolve(true));

// Service function
const terminalServiceSlow = () => ({
  getSessionToken,
  executeCommand: executeCommandSlow,
  closeSession,
});
const terminalServiceOk = () => ({
  getSessionToken,
  executeCommand: executeCommandOk,
  closeSession,
});
const terminalServiceEmulationFailed = () => ({
  getSessionToken,
  executeCommand: executeCommandEmulationFailed,
  closeSession,
});
const terminalSlow = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalServiceSlow,
});
const terminalOk = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalServiceOk,
});
const terminalEmulationFailed = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalServiceEmulationFailed,
});

// Tests
describe('#Terminal', function terminalTest() {
  this.timeout(5000);
  describe('Working with states', () => {
    it('Should return error when executing command on closed terminal', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommandOk.reset();
      closeSession.reset();

      const uAPITerminal = terminalOk({
        auth: config,
      });

      return uAPITerminal
        .closeSession()
        .then(() => uAPITerminal.executeCommand('I'))
        .then(() => Promise.reject(new Error('Command has been executed on closed terminal')))
        .catch((err) => {
          expect(closeSession.callCount).to.equal(1);
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandOk.callCount).to.equal(0);
          expect(err).to.be.an.instanceof(
            TerminalError.TerminalRuntimeError.TerminalIsClosed
          );
        });
    });
    it('Should return error when executing command on busy terminal', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommandSlow.reset();

      const uAPITerminal = terminalSlow({
        auth: config,
      });

      return uAPITerminal
        .executeCommand('I')
        .then(() => Promise.all(['I', 'I'].map(command => uAPITerminal.executeCommand(command))))
        .then(() => Promise.reject(new Error('Command has been executed on busy terminal')))
        .catch((err) => {
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandSlow.callCount).to.equal(2);
          expect(err).to.be.an.instanceof(
            TerminalError.TerminalRuntimeError.TerminalIsBusy
          );
        });
    });
  });
  describe('Executing commands', () => {
    it('Should execute command', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommandOk.reset();
      closeSession.reset();

      const uAPITerminal = terminalOk({
        auth: config,
      });

      return uAPITerminal
        .executeCommand('I')
        .then((response) => {
          expect(response).to.equal('IGNORED');
        })
        .then(() => uAPITerminal.closeSession())
        .then(() => {
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandOk.callCount).to.equal(1);
          expect(closeSession.callCount).to.equal(1);
          expect(executeCommandOk.getCall(0).args[0].sessionToken).to.equal(token);
          expect(executeCommandOk.getCall(0).args[0].command).to.equal('I');
        });
    });
  });
  describe('Working with emulation', () => {
    it('Should fail if emulation failed', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommandEmulationFailed.reset();

      const emulatePcc = '7j8i';
      const emulateConfig = Object.assign({}, config, {
        emulatePcc,
      });
      const uAPITerminal = terminalEmulationFailed({
        auth: emulateConfig,
        emulatePcc,
      });

      return uAPITerminal
        .executeCommand('I')
        .then(() => Promise.reject(new Error('Emulation has not failed')))
        .catch((err) => {
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandEmulationFailed.callCount).to.equal(1);
          expect(executeCommandEmulationFailed.getCall(0).args[0].sessionToken).to.equal(token);
          expect(executeCommandEmulationFailed.getCall(0).args[0].command).to.equal(`SEM/${emulatePcc}/AG`);
          expect(err).to.be.an.instanceof(
            TerminalError.TerminalRuntimeError.TerminalEmulationFailed
          );
        });
    });
    it('Should emulate pcc', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommandOk.reset();
      closeSession.reset();

      const emulatePcc = '7j8i';
      const emulateConfig = Object.assign({}, config, {
        emulatePcc,
      });
      const uAPITerminal = terminalOk({
        auth: emulateConfig,
        emulatePcc,
      });

      return uAPITerminal
        .executeCommand('I')
        .then((response) => {
          expect(response).to.equal('IGNORED');
        })
        .then(() => uAPITerminal.closeSession())
        .then(() => {
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandOk.callCount).to.equal(2);
          expect(closeSession.callCount).to.equal(1);
          expect(executeCommandOk.getCall(0).args[0].sessionToken).to.equal(token);
          expect(executeCommandOk.getCall(0).args[0].command).to.equal(`SEM/${emulatePcc}/AG`);
          expect(executeCommandOk.getCall(1).args[0].command).to.equal('I');
        });
    });
  });
});
