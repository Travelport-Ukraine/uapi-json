/*
  eslint-disable import/no-extraneous-dependencies
*/

import sinon from 'sinon';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import config from '../testconfig';

// Token const
const token = 'TOKEN';

// Spied functions
const getSessionToken = sinon.spy(() => Promise.resolve(token));
const executeCommand = sinon.spy((params) => {
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
const closeSession = sinon.spy(() => Promise.resolve(true));

// Service function
const terminalService = () => ({
  getSessionToken,
  executeCommand,
  closeSession,
});
const terminal = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalService,
});

// Tests
describe('#Terminal', function terminalTest() {
  this.timeout(5000);
  describe('Working with token', () => {
    it('Should execute command', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommand.reset();
      closeSession.reset();

      const uAPITerminal = terminal({
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
          expect(executeCommand.callCount).to.equal(1);
          expect(closeSession.callCount).to.equal(1);
          expect(executeCommand.getCall(0).args[0].sessionToken).to.equal(token);
          expect(executeCommand.getCall(0).args[0].command).to.equal('I');
        });
    });
    it('Should emulate pcc', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommand.reset();
      closeSession.reset();

      const emulatePcc = '7j8i';
      const uAPITerminal = terminal({
        auth: config,
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
          expect(executeCommand.callCount).to.equal(2);
          expect(closeSession.callCount).to.equal(1);
          expect(executeCommand.getCall(0).args[0].sessionToken).to.equal(token);
          expect(executeCommand.getCall(0).args[0].command).to.equal(`SEM/${emulatePcc}/AG`);
          expect(executeCommand.getCall(1).args[0].command).to.equal('I');
        });
    });
  });
});
