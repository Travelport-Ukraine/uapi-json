/*
  eslint-disable import/no-extraneous-dependencies
*/

import fs from 'fs';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import config from '../testconfig';
import uAPI from '../../src';

chai.use(sinonChai);

const TerminalError = uAPI.errors.Terminal;
const TerminalRuntimeError = TerminalError.TerminalRuntimeError;

const DumbErrorClosingSession = sinon.spy(() => true);
const ModifiedTerminalRuntimeError = Object.assign({}, TerminalRuntimeError, {
  ErrorClosingSession: DumbErrorClosingSession,
});

const wait = time => new Promise((resolve) => {
  setTimeout(() => resolve(), time);
});

const getTerminalResponse = path => new Promise((resolve, reject) => {
  fs.readFile(
    `${__dirname}/TerminalResponses/${path}.txt`,
    (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const res = data.toString().replace(/\s*$/, '');
      resolve(res.split(/\n/));
    },
  );
});

// Token const
const token = 'TOKEN';

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
const executeCommandMdIssues = sinon.spy((params) => {
  expect(params).to.be.an('object');
  expect(params.sessionToken).to.equal(token);
  expect(params.command).to.be.a('string');

  const mdCall = sinon.stub();
  mdCall.onCall(0).returns(
    getTerminalResponse('set02/HFF-P2')
  );
  mdCall.onCall(1).returns(
    getTerminalResponse('set02/HFF-P3')
  );

  switch (params.command) {
    case '*HFF':
      return getTerminalResponse('set02/HFF-P1');
    case 'MD':
      return mdCall();
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
const terminalCloseSessionError = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalServiceCloseSessionError,
  './TerminalErrors': {
    TerminalRuntimeError: ModifiedTerminalRuntimeError,
  },
});
const terminalSlow = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalServiceSlow,
});
const terminalOk = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalServiceOk,
});
const terminalMdIssues = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalServiceMdIssues,
});
const terminalEmulationFailed = proxyquire('../../src/Services/Terminal/Terminal', {
  './TerminalService': terminalServiceEmulationFailed,
});

// Tests
describe('#Terminal', function terminalTest() {
  this.timeout(5000);

  beforeEach(() => {
    sinon.spy(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  describe('Exit handlers', () => {
    it('should not close session in beforeExit for terminal with NONE state', (done) => {
      // Resetting spies
      closeSession.reset();

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
      closeSessionError.reset();

      const uAPITerminal = terminalCloseSessionError({
        auth: config,
        debug: 1,
      });

      return uAPITerminal.executeCommand('I')
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
    it('should throw an error for terminal with READY state', (done) => {
      // Resetting spies
      closeSession.reset();

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
  describe('Working with states', () => {
    it('Should return error when executing command on closed terminal', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommandOk.reset();
      closeSession.reset();

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
          expect(console.log).to.have.callCount(1);
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
            TerminalRuntimeError.TerminalIsBusy
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
    it('should concatenate command output with MD', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommandOk.reset();
      closeSession.reset();

      const uAPITerminal = terminalOk({
        auth: config,
      });

      return uAPITerminal
        .executeCommand('TE')
        .then((response) => {
          const expectedResponse = [
            'TKT: 064 9902 789263     NAME: CHERTOUSOV/DMYTROMR             ',
            '                                                               ',
            'ISSUED: 11JAN17          FOP:CASH                              ',
            'PSEUDO: 7J8J  PLATING CARRIER: OK  ISO: UA  IATA: 99999992     ',
            '   USE  CR FLT  CLS  DATE BRDOFF TIME  ST F/B        FARE   CPN',
            '   RFND OK  917  Q  15MAY KBPPRG  0505 OK Q0BAGG             1 ',
            '                                          NVB15MAY NVA15MAY    ',
            '   RFND OK  630  P  15MAY PRGBRU  0655 OK P0BAGG             2 ',
            '                                          NVB15MAY NVA15MAY    ',
            '                                                               ',
            'FARE USD    41.00 TAX      109UA TAX       55UD TAX     2075XT ',
            'TOTAL UAH     3357                                             ',
            'EQUIV UAH     1118                                             ',
            '   FARE RESTRICTIONS APPLY                                     ',
            '                                                               ',
            'IEV OK PRG 39.00 OK BRU 2.17 NUC41.17END ROE1.0 XT             ',
            '464YK231CZ1380YQ                                               ',
            'RLOC 1G BGQF5K    1A ZWWJYF                                    ',
            '                                                               ',
            '><',
          ].join('\n');
          expect(response).to.equal(expectedResponse);
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
      getSessionToken.reset();
      executeCommandOk.reset();
      closeSession.reset();

      const uAPITerminal = terminalMdIssues({
        auth: config,
      });

      return uAPITerminal.executeCommand('*HFF')
        .then((response) => {
          expect(response).to.equal('     *****      FILED FARE HISTORY          4PP13A    *****\nXFQ ZAINULLIN/IURIIMR-ADT  G  UAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT  TTLUAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT     UAH        0     03APR18\nAFQ ZAINULLIN/IURIIMR-ADT  G              7712625095845\nXFQ ZAINULLIN/IURIIMR-ADT  G  UAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT  TTLUAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT     UAH        0     03APR18\nAFQ ZAINULLIN/IURIIMR-ADT  G              7712625095845\nXFQ ZAINULLIN/IURIIMR-ADT  G  UAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT  TTLUAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT     UAH        0     03APR18\nAFQ ZAINULLIN/IURIIMR-ADT  G              7712625095845\nAFQ ZAINULLIN/IURIIMR-ADT  G              7712625095845\nXFQ ZAINULLIN/IURIIMR-ADT  G  UAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT  TTLUAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT     UAH        0     03APR18\nAFQ ZAINULLIN/IURIIMR-ADT  G              7712625095845\nXFQ ZAINULLIN/IURIIMR-ADT  G  UAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT  TTLUAH    13013      03APR18\nAOB ZAINULLIN/IURIIMR-ADT     UAH        0     03APR18\nAFQ ZAINULLIN/IURIIMR-ADT  G              7712625095845\nRCVD-\nCRDT- IEV/5JV7/1G AG          0648Z/03APR\nXFQ ZAINULLIN/IURIIMR    I-ADT  I  UAH    12698      03APR18\n\n>XFQP1/-P*5JV7/TA7W30)><\n)><');
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
            TerminalRuntimeError.TerminalEmulationFailed
          );
          return uAPITerminal.closeSession();
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

    it('Should work in stateless mod', () => {
      // Resetting spies
      getSessionToken.reset();
      executeCommandOk.reset();
      closeSession.reset();

      const emulatePcc = '7j8i';

      const emulateConfig = Object.assign({}, config, {
        emulatePcc,
      });

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

          const auth = Object.assign(
            {},
            emulateConfig,
            { token: sessionToken }
          );

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
