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
const { RequestRuntimeError: { UnhandledError } } = require('../../src/Request/RequestErrors');
const TerminalErrors = require('../../src/Services/Terminal/TerminalErrors');

chai.use(sinonChai);

const terminalPath = path.join(__dirname, '../../src/Services/Terminal/Terminal');
const { Terminal: { TerminalRuntimeError } } = uAPI.errors;

const wait = (time = 10) => new Promise((resolve) => {
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
const sessionToken = 'TOKEN';

const defaultPcc = '7J8J';
const semCommand = `SEM/${defaultPcc}/AG`;
const commandMatch = (command) => sinon.match.has('command', command);
const getTerminalConfig = (emulatePcc = defaultPcc) => ({ auth: { ...config, emulatePcc } });
const errorInstance = new Error('Fake error');
const ErrorClosingSessionStub = sinon.stub().returns(errorInstance);
const getSessionToken = sinon.stub().resolves({ sessionToken });
const executeCommand = sinon.stub();
const closeSession = sinon.stub();
const TerminalService = proxyquire(terminalPath, {
  './TerminalService': () => ({
    getSessionToken,
    executeCommand,
    closeSession,
  }),
  './TerminalErrors': {
    ...TerminalErrors,
    TerminalRuntimeError: {
      ...TerminalErrors.TerminalRuntimeError,
      ErrorClosingSession: ErrorClosingSessionStub,
    }
  },
});

// Tests
describe('#Terminal', function terminalTest() {
  this.timeout(5000);

  beforeEach(() => {
    getSessionToken.resetHistory();
    executeCommand.resetHistory();
    closeSession.resetHistory();
  });

  describe('Exit handlers', () => {
    const closeSessionError = new Error('Error closing session');

    before(() => {
      executeCommand.reset();
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('SEM'));
      executeCommand.withArgs(commandMatch('I')).resolves(getTerminalResponse('I'));
    });

    beforeEach(() => {
      closeSession.reset();
    });

    after(() => {
      executeCommand.reset();
    });

    it('should not close session in beforeExit for terminal with NONE state', async () => {
      closeSession.resolves(true);
      (() => new TerminalService(getTerminalConfig()))();

      process.emit('beforeExit');
      await wait();

      expect(closeSession.callCount).to.equal(0);
    });
    it('should throw an error when failed to close session', async () => {
      closeSession.rejects(closeSessionError);
      const terminal = new TerminalService(getTerminalConfig());

      await terminal.executeCommand('I');
      expect(closeSession).to.have.callCount(0);

      process.emit('beforeExit');
      await wait();

      expect(closeSession).to.have.callCount(1);
      expect(ErrorClosingSessionStub).to.have.callCount(1);
    });
    it('should autoclose more than one terminal', async () => {
      closeSession.resolves(true);
      const terminal1 = new TerminalService(getTerminalConfig());
      const terminal2 = new TerminalService(getTerminalConfig());

      await Promise.all([terminal1, terminal2].map((terminal) => terminal.executeCommand('I')));

      process.emit('beforeExit');
      await wait();

      expect(closeSession).to.have.callCount(2);
    });
    it('should not close terminal if autoClose is false', async () => {
      const terminal = new TerminalService({
        ...getTerminalConfig(),
        autoClose: false,
      });

      terminal.executeCommand('I');

      process.emit('beforeExit');
      await wait();

      // No autoclose
      expect(closeSession).to.have.callCount(0);
    });
  });
  describe('Handling uapi errors', () => {
    before(() => {
      closeSession.resolves(true);
    });

    beforeEach(() => {
      executeCommand.reset();
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('SEM'));
    });

    it('should fail if no handlers provided', async () => {
      const erError = new Error('ER error');
      erError.data = { faultstring: 'String index out of range: 6' };
      const erExecution = sinon.stub();
      erExecution.onCall(0).rejects(erError);
      erExecution.resolves(['OK']);
      executeCommand.withArgs(commandMatch('ER')).callsFake(erExecution);

      const terminal = new TerminalService(getTerminalConfig());

      try {
        await terminal.executeCommand('ER');
        throw new Error('did not fail');
      } catch (err) {
        expect(err.message).to.equal('ER error');
        expect(err.data).to.deep.equal({
          faultstring: 'String index out of range: 6',
        });
      }

      expect(closeSession.callCount).to.equal(0);

      await terminal.closeSession();

      expect(closeSession.callCount).to.equal(1);
      expect(getSessionToken.callCount).to.equal(1);
    });
    it('should apply error handler if provided', async () => {
      const erError = new Error('ER error');
      erError.data = { faultstring: 'String index out of range: 6' };
      const erExecution = sinon.stub();
      erExecution.onCall(0).rejects(erError);
      erExecution.resolves(['OK']);
      executeCommand.withArgs(commandMatch('ER')).callsFake(erExecution);

      const terminal = new TerminalService({
        ...getTerminalConfig(),
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

      const res = await terminal.executeCommand('ER');
      await terminal.closeSession();

      expect(res).to.deep.equal('OK');
      expect(closeSession.callCount).to.equal(1);
      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(3);
    });
  });
  describe('Working with states', () => {
    before(() => {
      closeSession.resolves(true);
    });

    beforeEach(() => {
      executeCommand.reset();
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('SEM'));
    });

    it('Should return error when executing command on closed terminal', async () => {
      const terminal = new TerminalService(getTerminalConfig());

      await terminal.closeSession();
      try {
        await terminal.executeCommand('I');
        throw new Error('Command has been executed on closed terminal');
      } catch (err) {
        expect(closeSession.callCount).to.equal(1);
        expect(getSessionToken.callCount).to.equal(1);
        expect(executeCommand.callCount).to.equal(1);
        expect(err).to.be.an.instanceof(
          TerminalRuntimeError.TerminalIsClosed
        );
      }
    });
    it('Should return error when executing command on busy terminal', async () => {
      executeCommand.withArgs(commandMatch('I')).resolves(wait(10).then(() => getTerminalResponse('SEM')));
      const terminal = new TerminalService(getTerminalConfig());

      await terminal.executeCommand('I');
      expect(executeCommand).to.have.callCount(2);

      try {
        await Promise.all(['I', 'I'].map((command) => terminal.executeCommand(command)));
        throw new Error('Command has been executed on busy terminal');
      } catch (err) {
        expect(err).to.be.an.instanceof(
          TerminalRuntimeError.TerminalIsBusy
        );
      }

      await terminal.closeSession();

      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(3);
      expect(closeSession.callCount).to.equal(1);
    });
  });
  describe('Executing commands', () => {
    before(() => {
      closeSession.resolves(true);
    });

    beforeEach(() => {
      executeCommand.reset();
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('SEM'));
    });

    it('Should execute command', async () => {
      executeCommand.withArgs(commandMatch('I')).resolves(getTerminalResponse('I'));
      const terminal = new TerminalService(getTerminalConfig());

      const response = await terminal.executeCommand('I');
      await terminal.closeSession();

      expect(response).to.equal('IGNORED');
      expect(getSessionToken.callCount).to.equal(1);
      expect(closeSession.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(2);
      expect(executeCommand).to.have.been.calledWithMatch({ sessionToken, command: 'I' });
    });
    it('Should execute command with custom stopMD function', async () => {
      executeCommand.withArgs(commandMatch('TE')).resolves(getTerminalResponse('set01/TE-P1'));
      executeCommand.withArgs(commandMatch('MD')).resolves(getTerminalResponse('set01/TE-P2'));
      const terminal = new TerminalService(getTerminalConfig());
      let intermediateResult = '';

      const result = await terminal.executeCommand('TE', (screens) => { intermediateResult = screens; return true; });
      await terminal.closeSession();

      expect(result).to.equal(intermediateResult);
    });
    it('should concatenate command output with MD', async () => {
      executeCommand.withArgs(commandMatch('TE')).resolves(getTerminalResponse('set01/TE-P1'));
      executeCommand.withArgs(commandMatch('MD')).resolves(getTerminalResponse('set01/TE-P2'));
      const terminal = new TerminalService(getTerminalConfig());

      const result = await terminal.executeCommand('TE');
      const composed = await getTerminalResponse('set01/TE-composed');
      await terminal.closeSession();

      expect(result.trimEnd()).to.equal(composed.join('\n').trimEnd());
      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(3);
      expect(closeSession.callCount).to.equal(1);
      expect(executeCommand).to.have.been.calledWithMatch({ sessionToken, command: 'TE' });
      expect(executeCommand).to.have.been.calledWithMatch({ sessionToken, command: 'MD' });
    });
    it('should handle uapi MD issues', async () => {
      const sessionError = {
        detail: {
          'common_v33_0:ErrorInfo': {
            'common_v33_0:Code': '14058',
          }
        }
      };
      const mdError = new UnhandledError(null, new TerminalRuntimeError(sessionError));
      const mdExecution = sinon.stub();
      mdExecution.onCall(0).resolves(getTerminalResponse('set02/HFF-P2'));
      mdExecution.onCall(1).rejects(mdError);
      mdExecution.onCall(2).resolves(getTerminalResponse('set02/HFF-P3'));
      executeCommand.withArgs(commandMatch('MD')).callsFake(mdExecution);
      executeCommand.withArgs(commandMatch('*HFF')).resolves(getTerminalResponse('set02/HFF-P1'));
      const terminal = new TerminalService(getTerminalConfig());

      const result = await terminal.executeCommand('*HFF');
      const composed = await getTerminalResponse('set02/HFF-composed');
      await terminal.closeSession();

      expect(result.trimEnd()).to.equal(composed.join('\n').trimEnd());
    });
  });
  describe('Working with emulation', () => {
    before(() => {
      closeSession.resolves(true);
    });

    beforeEach(() => {
      executeCommand.reset();
    });

    it('Should fail if emulation failed', async () => {
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('RESTRICTED'));
      const terminal = new TerminalService(getTerminalConfig());

      try {
        await terminal.executeCommand('I');
        throw new Error('Emulation has not failed');
      } catch (err) {
        expect(getSessionToken.callCount).to.equal(1);
        expect(executeCommand.callCount).to.equal(1);
        expect(executeCommand).to.have.been.calledWithMatch({ sessionToken, command: semCommand });
        expect(err).to.be.an.instanceof(
          TerminalRuntimeError.TerminalEmulationFailed
        );
      }

      await terminal.closeSession();
    });
    it('Should fail if not authorized by galileo', async () => {
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('NOT_AUTHORISED'));
      const terminal = new TerminalService(getTerminalConfig());

      try {
        await terminal.executeCommand('I');
        throw new Error('Emulation has not failed');
      } catch (e) {
        expect(e).to.be.an.instanceof(
          TerminalRuntimeError.TerminalAuthIssue
        );
      }

      await terminal.closeSession();
    });
    it('Should fail if invalid account', async () => {
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('INVALID_ACCOUNT'));
      const terminal = new TerminalService(getTerminalConfig());

      try {
        await terminal.executeCommand('I');
        throw new Error('Emulation has not failed');
      } catch (e) {
        expect(e).to.be.an.instanceof(
          TerminalRuntimeError.InvalidAccount
        );
      }

      await terminal.closeSession();
    });
    it('Should emulate pcc', async () => {
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('SEM'));
      executeCommand.withArgs(commandMatch('I')).resolves(getTerminalResponse('I'));
      const terminal = new TerminalService(getTerminalConfig());

      const response = await terminal.executeCommand('I');
      await terminal.closeSession();

      expect(response).to.equal('IGNORED');
      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(2);
      expect(closeSession.callCount).to.equal(1);
      expect(executeCommand.getCall(0).args[0].sessionToken).to.equal(sessionToken);
      expect(executeCommand).to.have.been.calledWithMatch({ sessionToken, command: semCommand });
      expect(executeCommand).to.have.been.calledWithMatch({ sessionToken, command: 'I' });
    });

    it('Should work in stateless mod', async () => {
      executeCommand.withArgs(commandMatch(`SEM/${defaultPcc}/AG`)).resolves(getTerminalResponse('SEM'));
      executeCommand.withArgs(commandMatch('I')).resolves(getTerminalResponse('I'));
      const baseConfig = getTerminalConfig();
      const terminal1 = new TerminalService(baseConfig);
      const token = await terminal1.getToken();
      const terminal2 = new TerminalService({
        ...baseConfig, auth: { ...baseConfig.auth, token },
      });

      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(1);
      expect(closeSession.callCount).to.equal(0);

      await terminal1.closeSession();
      await terminal2.executeCommand('I');
      await terminal2.closeSession();

      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(2);
      expect(closeSession.callCount).to.equal(2);
      expect(sessionToken).to.be.equal(sessionToken);
    });
  });
});
