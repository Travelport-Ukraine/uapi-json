/*
  eslint-disable import/no-extraneous-dependencies
*/

const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const chai = require('chai');
const { expect } = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const config = require('../testconfig');
const uAPI = require('../../src');
const { RequestRuntimeError } = require('../../src/Request/RequestErrors');

chai.use(sinonChai);
process.setMaxListeners(20);

const terminalPath = path.join(__dirname, '../../src/Services/Terminal/Terminal');
const { Terminal: { TerminalRuntimeError } } = uAPI.errors;

const DumbErrorClosingSession = sinon.spy(() => true);
const ModifiedTerminalRuntimeError = {
  ...TerminalRuntimeError,
  ErrorClosingSession: DumbErrorClosingSession,
};

const wait = (time) => new Promise((resolve) => {
  setTimeout(() => resolve(), time);
});

const getTerminalResponse = (p) => new Promise((resolve, reject) => {
  fs.readFile(
    `${__dirname}/TerminalResponses/${p}.txt`,
    (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const res = data.toString().trimEnd();
      resolve(res.split(/\n/));
    }
  );
});

// Token const
const token = 'TOKEN';

const sessionError = {
  detail: {
    'common_v33_0:ErrorInfo': {
      'common_v33_0:Code': '14058',
    }
  }
};

// Spied functions
const getSessionToken = sinon.spy(() => Promise.resolve({ sessionToken: token }));
const executeCommandSlow = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');
  switch (params.command) {
    case 'I':
      return wait(100)
        .then(() => getTerminalResponse('I'));
    default:
      if (params.command.match(/^SEM/)) {
        return getTerminalResponse('SEM');
      }
      return getTerminalResponse('ERR');
  }
});
const executeCommandOk = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');
  switch (params.command) {
    case 'I':
      return getTerminalResponse('I');
    case 'TE':
      return getTerminalResponse('set01/TE-P1');
    case 'MD':
      return getTerminalResponse('set01/TE-P2');
    default:
      if (params.command.match(/^SEM/)) {
        return getTerminalResponse('SEM');
      }
      return getTerminalResponse('ERR');
  }
});

const erIssues = sinon.stub();
const executeCommandErIssues = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');

  const erError = new Error('ER error');
  erError.data = {
    faultstring: 'String index out of range: 6',
  };

  erIssues.resolves(['OK']);
  erIssues.onCall(0).throws(erError);

  switch (params.command) {
    case 'ER':
      return erIssues();
    default:
      return ['*'];
  }
});
const mdCallMdIssues = sinon.stub();
const executeCommandMdIssues = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');

  mdCallMdIssues.onCall(0).returns(
    getTerminalResponse('set02/HFF-P2')
  );
  mdCallMdIssues.onCall(1).throws(
    new RequestRuntimeError.UnhandledError(null, new TerminalRuntimeError(sessionError))
  );
  mdCallMdIssues.onCall(2).returns(
    getTerminalResponse('set02/HFF-P3')
  );

  switch (params.command) {
    case '*HFF':
      return getTerminalResponse('set02/HFF-P1');
    case 'MD':
      return mdCallMdIssues();
    default:
      if (params.command.match(/^SEM/)) {
        return getTerminalResponse('SEM');
      }
      return getTerminalResponse('ERR');
  }
});
const executeCommandEmulationFailed = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');
  switch (params.command) {
    case 'I':
      return getTerminalResponse('I');
    default:
      if (params.command.match(/SEM\/6K66\/AG/)) {
        return getTerminalResponse('NOT_AUTHORISED');
      }

      if (params.command.match(/^SEM/)) {
        return getTerminalResponse('RESTRICTED');
      }
      return getTerminalResponse('ERR');
  }
});

const closeSession = sinon.spy(() => Promise.resolve(true));
const closeSessionError = sinon.spy(() => Promise.reject(new Error('Error closing session')));

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
const terminalServiceErIssues = () => ({
  getSessionToken,
  executeCommand: executeCommandErIssues,
  closeSession,
});
const terminalServiceMdIssues = () => ({
  getSessionToken,
  executeCommand: executeCommandMdIssues,
  closeSession,
});
const terminalServiceCloseSessionError = () => ({
  getSessionToken,
  executeCommand: executeCommandOk,
  closeSession: closeSessionError,
});
const terminalServiceEmulationFailed = () => ({
  getSessionToken,
  executeCommand: executeCommandEmulationFailed,
  closeSession,
});
const terminalErIssues = proxyquire(terminalPath, {
  './TerminalService': terminalServiceErIssues,
});
const terminalCloseSessionError = proxyquire(terminalPath, {
  './TerminalService': terminalServiceCloseSessionError,
  './TerminalErrors': {
    TerminalRuntimeError: ModifiedTerminalRuntimeError,
  },
});
const terminalSlow = proxyquire(terminalPath, {
  './TerminalService': terminalServiceSlow,
});
const terminalOk = proxyquire(terminalPath, {
  './TerminalService': terminalServiceOk,
});
const terminalMdIssues = proxyquire(terminalPath, {
  './TerminalService': terminalServiceMdIssues,
});
const terminalEmulationFailed = proxyquire(terminalPath, {
  './TerminalService': terminalServiceEmulationFailed,
});

const createUapiTerminal = (emulatePcc, terminalFunc) => {
  const emulateConfig = { ...config, emulatePcc };
  return terminalFunc({
    auth: emulateConfig,
    emulatePcc,
  });
};

// Tests
describe('#Terminal', function terminalTest() {
  this.timeout(5000);

  describe('Exit handlers', () => {
    it('should not close session in beforeExit for terminal with NONE state', (done) => {
      // Resetting spies
      closeSession.resetHistory();

      terminalOk({
        auth: config,
      });

      process.emit('beforeExit');
      setTimeout(() => {
        expect(closeSession.callCount).to.equal(0);
        done();
      }, 100);
    });
    it('should throw an error when failed to close session', (done) => {
      // Resetting spies
      closeSessionError.resetHistory();

      const uAPITerminal = terminalCloseSessionError({
        auth: config,
        debug: 1,
      });

      uAPITerminal.executeCommand('I')
        .then(() => {
          expect(closeSession.callCount).to.equal(0);
          process.emit('beforeExit');
          setTimeout(() => {
            expect(closeSessionError).to.have.callCount(1);
            expect(DumbErrorClosingSession).to.have.callCount(1);
            expect(console.log).to.have.callCount(4);
            done();
          }, 100);
        });
    });
    it('should autoclose more than one terminal', (done) => {
      // Resetting spies
      closeSessionError.resetHistory();

      const uAPITerminal1 = terminalCloseSessionError({
        auth: config,
        debug: 1,
      });
      const uAPITerminal2 = terminalOk({
        auth: config,
        debug: 1,
      });

      Promise.all([
        uAPITerminal1.executeCommand('I')
          .then(() => {
            expect(closeSession.callCount).to.equal(0);
          }),
        uAPITerminal2.executeCommand('I')
          .then(() => {
            expect(closeSession.callCount).to.equal(0);
          }),
      ]).then(() => {
        process.emit('beforeExit');
        setTimeout(() => {
          expect(closeSessionError).to.have.callCount(1);
          expect(DumbErrorClosingSession).to.have.callCount(2);
          expect(console.log).to.have.callCount(12);
          done();
        }, 100);
      });
    });
    it('should throw an error for terminal with READY state', (done) => {
      // Resetting spies
      closeSession.resetHistory();

      const uAPITerminal = terminalOk({
        auth: config,
      });

      uAPITerminal.executeCommand('I')
        .then(() => {
          expect(closeSession.callCount).to.equal(0);
          process.emit('beforeExit');
          setTimeout(() => {
            expect(closeSession).to.have.callCount(1);
            done();
          }, 100);
        });
    });
  });
  describe('Handling uapi errors', () => {
    beforeEach(() => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandOk.resetHistory();
      closeSession.resetHistory();
      erIssues.resetHistory();
      executeCommandErIssues.resetHistory();
    });
    it('should fail if no handlers provided', async () => {
      const uAPITerminal = terminalErIssues({
        auth: config,
        debug: 1,
      });

      try {
        await uAPITerminal.executeCommand('ER');
        throw new Error('did not fail');
      } catch (err) {
        expect(err.message).to.equal('ER error');
        expect(err.data).to.deep.equal({
          faultstring: 'String index out of range: 6',
        });
      }

      expect(closeSession.callCount).to.equal(0);
      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommandErIssues.callCount).to.equal(1);
    });
    it('should apply error handler if provided', async () => {
      const uAPITerminal = terminalErIssues({
        auth: config,
        debug: 1,
        options: {
          uapiErrorHandler: async (
            executeCommandWithRetry,
            { command, error: err }
          ) => {
            expect(err.message).to.equal('ER error');
            expect(err.data).to.deep.equal({
              faultstring: 'String index out of range: 6',
            });

            return executeCommandWithRetry(command, 0);
          },
        }
      });

      const res = await uAPITerminal.executeCommand('ER');
      await uAPITerminal.closeSession();

      expect(res).to.deep.equal('OK');
      expect(closeSession.callCount).to.equal(1);
      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommandErIssues.callCount).to.equal(2);
    });
  });
  describe('Working with states', () => {
    beforeEach(() => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandOk.resetHistory();
      closeSession.resetHistory();
    });
    it('Should return error when executing command on closed terminal', () => {
      const uAPITerminal = terminalOk({
        auth: config,
        debug: 1,
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
            TerminalRuntimeError.TerminalIsClosed
          );
        });
    });
    it('Should return error when executing command on busy terminal', () => {
      const uAPITerminal = terminalSlow({
        auth: config,
      });

      return uAPITerminal
        .executeCommand('I')
        .then(() => Promise.all(['I', 'I'].map((command) => uAPITerminal.executeCommand(command))))
        .then(() => Promise.reject(new Error('Command has been executed on busy terminal')))
        .catch((err) => {
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandSlow.callCount).to.equal(2);
          expect(err).to.be.an.instanceof(
            TerminalRuntimeError.TerminalIsBusy
          );
        });
    });
  });
  describe('Executing commands', () => {
    it('Should execute command', () => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandOk.resetHistory();
      closeSession.resetHistory();

      const uAPITerminal = terminalOk({
        auth: config,
        debug: 1,
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
          expect(console.log).to.have.callCount(2);
        });
    });
    it('Should execute command with custop stopMD function', () => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandOk.resetHistory();
      closeSession.resetHistory();

      const uAPITerminal = terminalOk({
        auth: config,
        debug: 0,
      });

      let result = '';

      return uAPITerminal
        .executeCommand('TE', (screens) => {
          result = screens;
          return true;
        })
        .then((response) => {
          expect(response).to.equal(result);
        });
    });
    it('should concatenate command output with MD', () => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandOk.resetHistory();
      closeSession.resetHistory();

      const uAPITerminal = terminalOk({
        auth: config,
      });

      return Promise.all([
        uAPITerminal.executeCommand('TE'),
        getTerminalResponse('set01/TE-composed'),
      ])
        .then(([response, composed]) => {
          expect(response.trimEnd()).to.equal(composed.join('\n').trimEnd());
        })
        .then(() => uAPITerminal.closeSession())
        .then(() => {
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandOk.callCount).to.equal(2);
          expect(closeSession.callCount).to.equal(1);
          expect(executeCommandOk.getCall(0).args[0].sessionToken).to.equal(token);
          expect(executeCommandOk.getCall(0).args[0].command).to.equal('TE');
          expect(executeCommandOk.getCall(1).args[0].command).to.equal('MD');
        });
    });
    it('should handle uapi MD issues', () => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandOk.resetHistory();
      closeSession.resetHistory();

      const uAPITerminal = terminalMdIssues({
        auth: config,
      });

      return Promise.all([
        uAPITerminal.executeCommand('*HFF'),
        getTerminalResponse('set02/HFF-composed'),
      ])
        .then(([response, composed]) => {
          expect(response.trimEnd()).to.equal(composed.join('\n').trimEnd());
        });
    });
  });
  describe('Working with emulation', () => {
    it('Should fail if emulation failed', () => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandEmulationFailed.resetHistory();

      const emulatePcc = '7j8i';
      const uAPITerminal = createUapiTerminal(emulatePcc, terminalEmulationFailed);

      return uAPITerminal
        .executeCommand('I')
        .then(() => Promise.reject(new Error('Emulation has not failed')))
        .catch((err) => {
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandEmulationFailed.callCount).to.equal(1);
          expect(executeCommandEmulationFailed.getCall(0).args[0].sessionToken).to.equal(token);
          expect(executeCommandEmulationFailed.getCall(0).args[0].command).to.equal(`SEM/${emulatePcc}/AG`);
          expect(err).to.be.an.instanceof(
            TerminalRuntimeError.TerminalEmulationFailed
          );
          return uAPITerminal.closeSession();
        });
    });
    it('Should fail if not authorised by galileo', async () => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandEmulationFailed.resetHistory();

      const emulatePcc = '6K66';
      const uAPITerminal = createUapiTerminal(emulatePcc, terminalEmulationFailed);

      try {
        await uAPITerminal.executeCommand('I');
        throw new Error('Emulation has not failed');
      } catch (e) {
        expect(e).to.be.an.instanceof(
          TerminalRuntimeError.TerminalAuthIssue
        );
      }

      await uAPITerminal.closeSession();
    });
    it('Should emulate pcc', () => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandOk.resetHistory();
      closeSession.resetHistory();

      const emulatePcc = '7j8i';
      const emulateConfig = { ...config, emulatePcc };
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

    it('Should work in stateless mod', () => {
      // Resetting spies
      getSessionToken.resetHistory();
      executeCommandOk.resetHistory();
      closeSession.resetHistory();

      const emulatePcc = '7j8i';

      const emulateConfig = { ...config, emulatePcc };

      let uAPITerminal = terminalOk({
        auth: emulateConfig,
        autoClose: false,
      });

      return uAPITerminal.getToken()
        .then((sessionToken) => {
          expect(sessionToken).to.be.equal('TOKEN');
          expect(getSessionToken.callCount).to.equal(1);
          expect(executeCommandOk.callCount).to.equal(1);
          expect(closeSession.callCount).to.equal(0);

          uAPITerminal = null;

          const auth = {

            ...emulateConfig,
            token: sessionToken
          };

          uAPITerminal = terminalOk({
            auth,
            autoClose: false,
          });

          return uAPITerminal
            .executeCommand('I')
            .then(() => uAPITerminal.closeSession())
            .then(() => {
              expect(getSessionToken.callCount).to.equal(1);
              expect(executeCommandOk.callCount).to.equal(2);
              expect(closeSession.callCount).to.equal(1);
            });
        });
    });
  });
});
