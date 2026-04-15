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
const terminalResponse = (response) => [response];
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

      const activeCommand = terminal.executeCommand('I');

      try {
        await terminal.executeCommand('I');
        throw new Error('Command has been executed on busy terminal');
      } catch (err) {
        expect(err).to.be.an.instanceof(
          TerminalRuntimeError.TerminalIsBusy
        );
      }

      try {
        await terminal.closeSession();
        throw new Error('Terminal has been closed while command is active');
      } catch (err) {
        expect(err).to.be.an.instanceof(
          TerminalRuntimeError.TerminalIsBusy
        );
      }

      await activeCommand;
      await terminal.closeSession();

      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(2);
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

      const result = await terminal.executeCommand('TE', {
        stopMD: (screens) => { intermediateResult = screens; return true; },
      });
      await terminal.closeSession();

      expect(result).to.equal(intermediateResult);
    });
    it('Should ignore legacy custom stopMD function as second param', async () => {
      executeCommand.withArgs(commandMatch('TE')).resolves(getTerminalResponse('set01/TE-P1'));
      executeCommand.withArgs(commandMatch('MD')).resolves(getTerminalResponse('set01/TE-P2'));
      const terminal = new TerminalService(getTerminalConfig());

      await terminal.executeCommand('TE', () => true);
      await terminal.closeSession();

      expect(executeCommand).to.have.been.calledWithMatch({ sessionToken, command: 'MD' });
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
  describe('Command sleep interval', () => {
    const stopMD = () => true;

    before(() => {
      closeSession.resolves(true);
    });

    beforeEach(() => {
      executeCommand.reset();
    });

    it('Should not sleep before first successful terminal result', async () => {
      const clock = sinon.useFakeTimers({ now: 1000 });
      const commandTimes = [];
      executeCommand.withArgs(commandMatch('FIRST')).callsFake(() => {
        commandTimes.push(Date.now());
        return Promise.resolve(terminalResponse('FIRST RESPONSE'));
      });
      const terminal = new TerminalService(getTerminalConfig(false));

      try {
        const response = await terminal.executeCommand('FIRST', {
          stopMD,
          sleepInterval: 1000,
        });
        await terminal.closeSession();

        expect(response).to.equal('FIRST RESPONSE');
        expect(commandTimes).to.deep.equal([1000]);
      } finally {
        clock.restore();
      }
    });
    it('Should sleep after successful SEM before next command', async () => {
      const clock = sinon.useFakeTimers({ now: 1000 });
      const commandTimes = [];
      executeCommand.withArgs(commandMatch(semCommand)).callsFake(() => {
        commandTimes.push({ command: semCommand, time: Date.now() });
        return Promise.resolve(terminalResponse('PROCEED'));
      });
      executeCommand.withArgs(commandMatch('I')).callsFake(() => {
        commandTimes.push({ command: 'I', time: Date.now() });
        return Promise.resolve(terminalResponse('IGNORED'));
      });
      const terminal = new TerminalService(getTerminalConfig());

      try {
        const command = terminal.executeCommand('I', { stopMD, sleepInterval: 1000 });
        await Promise.resolve();

        expect(commandTimes).to.deep.equal([{ command: semCommand, time: 1000 }]);

        await clock.tickAsync(999);
        expect(commandTimes).to.deep.equal([{ command: semCommand, time: 1000 }]);

        await clock.tickAsync(1);
        expect(await command).to.equal('IGNORED');
        await terminal.closeSession();

        expect(commandTimes).to.deep.equal([
          { command: semCommand, time: 1000 },
          { command: 'I', time: 2000 },
        ]);
      } finally {
        clock.restore();
      }
    });
    it('Should update sleep timestamp after all MD screens are received', async () => {
      const clock = sinon.useFakeTimers({ now: 0 });
      let stopMDCalls = 0;
      const stopAfterMD = () => {
        stopMDCalls += 1;
        return stopMDCalls === 2;
      };
      const commandTimes = [];
      executeCommand.withArgs(commandMatch('TE')).callsFake(() => {
        commandTimes.push({ command: 'TE', time: Date.now() });
        return Promise.resolve(terminalResponse('FIRST PAGE'));
      });
      executeCommand.withArgs(commandMatch('MD')).callsFake(() => {
        commandTimes.push({ command: 'MD', time: Date.now() });
        return wait(500).then(() => terminalResponse('SECOND PAGE'));
      });
      executeCommand.withArgs(commandMatch('SECOND')).callsFake(() => {
        commandTimes.push({ command: 'SECOND', time: Date.now() });
        return Promise.resolve(terminalResponse('SECOND RESPONSE'));
      });
      const terminal = new TerminalService(getTerminalConfig(false));

      try {
        const firstCommand = terminal.executeCommand('TE', {
          stopMD: stopAfterMD,
          sleepInterval: 1000,
        });
        await clock.tickAsync(500);
        await firstCommand;

        const secondCommand = terminal.executeCommand('SECOND', { stopMD, sleepInterval: 1000 });
        await Promise.resolve();
        await clock.tickAsync(999);

        expect(commandTimes).to.deep.equal([
          { command: 'TE', time: 0 },
          { command: 'MD', time: 0 },
        ]);

        await clock.tickAsync(1);
        expect(await secondCommand).to.equal('SECOND RESPONSE');
        await terminal.closeSession();

        expect(commandTimes).to.deep.equal([
          { command: 'TE', time: 0 },
          { command: 'MD', time: 0 },
          { command: 'SECOND', time: 1500 },
        ]);
      } finally {
        clock.restore();
      }
    });
    it('Should apply queued stateless command sleep while terminal stays busy', async () => {
      const clock = sinon.useFakeTimers({ now: 0 });
      const commandTimes = [];
      executeCommand.withArgs(commandMatch('FIRST')).callsFake(() => {
        commandTimes.push({ command: 'FIRST', time: Date.now() });
        return wait(100).then(() => terminalResponse('FIRST RESPONSE'));
      });
      executeCommand.withArgs(commandMatch('SECOND')).callsFake(() => {
        commandTimes.push({ command: 'SECOND', time: Date.now() });
        return Promise.resolve(terminalResponse('SECOND RESPONSE'));
      });
      const terminal = new TerminalService(getTerminalConfig(false));

      try {
        const activeCommand = terminal.executeCommand('FIRST', { stopMD });
        const queuedCommand = terminal.executeStatelessCommandWhenIdle('SECOND', {
          stopMD,
          sleepInterval: 1000,
        });

        await clock.tickAsync(100);
        expect(await activeCommand).to.equal('FIRST RESPONSE');

        await clock.tickAsync(999);
        expect(commandTimes).to.deep.equal([{ command: 'FIRST', time: 0 }]);

        try {
          await terminal.closeSession();
          throw new Error('Terminal has been closed while sleeping before stateless command');
        } catch (err) {
          expect(err).to.be.an.instanceof(TerminalRuntimeError.TerminalIsBusy);
        }

        await clock.tickAsync(1);
        expect(await queuedCommand).to.equal('SECOND RESPONSE');
        await terminal.closeSession();

        expect(commandTimes).to.deep.equal([
          { command: 'FIRST', time: 0 },
          { command: 'SECOND', time: 1100 },
        ]);
      } finally {
        clock.restore();
      }
    });
    it('Should not update sleep timestamp after failed queued command', async () => {
      const clock = sinon.useFakeTimers({ now: 0 });
      const failedCommandError = new Error('FAILED COMMAND');
      const commandTimes = [];
      executeCommand.withArgs(commandMatch('FIRST')).callsFake(() => {
        commandTimes.push({ command: 'FIRST', time: Date.now() });
        return wait(100).then(() => terminalResponse('FIRST RESPONSE'));
      });
      executeCommand.withArgs(commandMatch('FAIL')).callsFake(() => {
        commandTimes.push({ command: 'FAIL', time: Date.now() });
        return Promise.reject(failedCommandError);
      });
      executeCommand.withArgs(commandMatch('SECOND')).callsFake(() => {
        commandTimes.push({ command: 'SECOND', time: Date.now() });
        return Promise.resolve(terminalResponse('SECOND RESPONSE'));
      });
      const terminal = new TerminalService(getTerminalConfig(false));

      try {
        const activeCommand = terminal.executeStatelessCommandWhenIdle('FIRST', { stopMD });
        const failedCommand = terminal
          .executeStatelessCommandWhenIdle('FAIL', { stopMD, sleepInterval: 1000 })
          .catch((err) => err);
        const queuedCommand = terminal.executeStatelessCommandWhenIdle('SECOND', {
          stopMD,
          sleepInterval: 1000,
        });

        await clock.tickAsync(1100);

        expect(await activeCommand).to.equal('FIRST RESPONSE');
        expect(await failedCommand).to.equal(failedCommandError);
        expect(await queuedCommand).to.equal('SECOND RESPONSE');
        await terminal.closeSession();

        expect(commandTimes).to.deep.equal([
          { command: 'FIRST', time: 0 },
          { command: 'FAIL', time: 1100 },
          { command: 'SECOND', time: 1100 },
        ]);
      } finally {
        clock.restore();
      }
    });
  });
  describe('Executing stateless commands', () => {
    const stopMD = () => true;

    before(() => {
      closeSession.resolves(true);
    });

    beforeEach(() => {
      executeCommand.reset();
    });

    it('Should execute stateless command immediately when terminal is idle', async () => {
      executeCommand.withArgs(commandMatch('I')).resolves(terminalResponse('IGNORED'));
      const terminal = new TerminalService(getTerminalConfig(false));

      const response = await terminal.executeStatelessCommandWhenIdle('I', { stopMD });
      await terminal.closeSession();

      expect(response).to.equal('IGNORED');
      expect(getSessionToken.callCount).to.equal(1);
      expect(executeCommand.callCount).to.equal(1);
      expect(closeSession.callCount).to.equal(1);
      expect(executeCommand).to.have.been.calledWithMatch({ sessionToken, command: 'I' });
    });
    it('Should execute stateless command after active command is finished', async () => {
      executeCommand.withArgs(commandMatch('FIRST')).resolves(
        wait(20).then(() => terminalResponse('FIRST RESPONSE'))
      );
      executeCommand.withArgs(commandMatch('SECOND')).resolves(terminalResponse('SECOND RESPONSE'));
      const terminal = new TerminalService(getTerminalConfig(false));

      const activeCommand = terminal.executeCommand('FIRST', { stopMD });
      await wait();
      const queuedCommand = terminal.executeStatelessCommandWhenIdle('SECOND', { stopMD });

      expect(executeCommand.callCount).to.equal(1);

      const responses = await Promise.all([activeCommand, queuedCommand]);
      await terminal.closeSession();

      expect(responses).to.deep.equal(['FIRST RESPONSE', 'SECOND RESPONSE']);
      expect(executeCommand.callCount).to.equal(2);
      expect(executeCommand.getCall(0).args[0].command).to.equal('FIRST');
      expect(executeCommand.getCall(1).args[0].command).to.equal('SECOND');
    });
    it('Should execute multiple stateless commands in FIFO order', async () => {
      executeCommand.withArgs(commandMatch('FIRST')).resolves(
        wait(20).then(() => terminalResponse('FIRST RESPONSE'))
      );
      executeCommand.withArgs(commandMatch('SECOND')).resolves(terminalResponse('SECOND RESPONSE'));
      executeCommand.withArgs(commandMatch('THIRD')).resolves(terminalResponse('THIRD RESPONSE'));
      const terminal = new TerminalService(getTerminalConfig(false));

      const responses = await Promise.all([
        terminal.executeStatelessCommandWhenIdle('FIRST', { stopMD }),
        terminal.executeStatelessCommandWhenIdle('SECOND', { stopMD }),
        terminal.executeStatelessCommandWhenIdle('THIRD', { stopMD }),
      ]);
      await terminal.closeSession();

      expect(responses).to.deep.equal([
        'FIRST RESPONSE',
        'SECOND RESPONSE',
        'THIRD RESPONSE',
      ]);
      expect(executeCommand.getCall(0).args[0].command).to.equal('FIRST');
      expect(executeCommand.getCall(1).args[0].command).to.equal('SECOND');
      expect(executeCommand.getCall(2).args[0].command).to.equal('THIRD');
    });
    it('Should continue stateless queue after queued command failure', async () => {
      const failedCommandError = new Error('FAILED COMMAND');
      executeCommand.withArgs(commandMatch('FIRST')).resolves(
        wait(20).then(() => terminalResponse('FIRST RESPONSE'))
      );
      executeCommand.withArgs(commandMatch('FAIL')).rejects(failedCommandError);
      executeCommand.withArgs(commandMatch('SECOND')).resolves(terminalResponse('SECOND RESPONSE'));
      const terminal = new TerminalService(getTerminalConfig(false));

      const activeCommand = terminal.executeCommand('FIRST', { stopMD });
      await wait();
      const failedCommand = terminal
        .executeStatelessCommandWhenIdle('FAIL', { stopMD })
        .catch((err) => err);
      const queuedCommand = terminal.executeStatelessCommandWhenIdle('SECOND', { stopMD });

      const responses = await Promise.all([activeCommand, failedCommand, queuedCommand]);
      await terminal.closeSession();

      expect(responses).to.deep.equal([
        'FIRST RESPONSE',
        failedCommandError,
        'SECOND RESPONSE',
      ]);
      expect(executeCommand.getCall(0).args[0].command).to.equal('FIRST');
      expect(executeCommand.getCall(1).args[0].command).to.equal('FAIL');
      expect(executeCommand.getCall(2).args[0].command).to.equal('SECOND');
    });
    it('Should reject queued stateless commands when active command fails', async () => {
      const failedCommandError = new Error('FAILED COMMAND');
      executeCommand.withArgs(commandMatch('FIRST')).rejects(failedCommandError);
      executeCommand.withArgs(commandMatch('SECOND')).resolves(terminalResponse('SECOND RESPONSE'));
      const terminal = new TerminalService(getTerminalConfig(false));

      const activeCommand = terminal.executeCommand('FIRST', { stopMD }).catch((err) => err);
      const queuedCommand = terminal
        .executeStatelessCommandWhenIdle('SECOND', { stopMD })
        .catch((err) => err);

      const responses = await Promise.all([activeCommand, queuedCommand]);
      await terminal.closeSession();

      expect(responses).to.deep.equal([
        failedCommandError,
        failedCommandError,
      ]);
      expect(executeCommand.callCount).to.equal(1);
      expect(executeCommand.getCall(0).args[0].command).to.equal('FIRST');
      expect(closeSession.callCount).to.equal(1);
    });
    it('Should reject later commands with saved terminal error', async () => {
      const failedCommandError = new Error('FAILED COMMAND');
      executeCommand.withArgs(commandMatch('FAIL')).rejects(failedCommandError);
      executeCommand.withArgs(commandMatch('SECOND')).resolves(terminalResponse('SECOND RESPONSE'));
      const terminal = new TerminalService(getTerminalConfig(false));

      const failedCommand = await terminal
        .executeStatelessCommandWhenIdle('FAIL', { stopMD })
        .catch((err) => err);
      const regularCommand = await terminal
        .executeCommand('SECOND', { stopMD })
        .catch((err) => err);
      const statelessCommand = await terminal
        .executeStatelessCommandWhenIdle('SECOND', { stopMD })
        .catch((err) => err);
      await terminal.closeSession();

      expect(failedCommand).to.equal(failedCommandError);
      expect(regularCommand).to.equal(failedCommandError);
      expect(statelessCommand).to.equal(failedCommandError);
      expect(executeCommand.callCount).to.equal(1);
      expect(executeCommand.getCall(0).args[0].command).to.equal('FAIL');
      expect(closeSession.callCount).to.equal(1);
    });
    it('Should use custom stopMD function for queued stateless command', async () => {
      executeCommand.withArgs(commandMatch('FIRST')).resolves(
        wait(20).then(() => terminalResponse('FIRST RESPONSE'))
      );
      executeCommand.withArgs(commandMatch('TE')).resolves(getTerminalResponse('set01/TE-P1'));
      const terminal = new TerminalService(getTerminalConfig(false));
      let intermediateResult = '';

      const activeCommand = terminal.executeCommand('FIRST', { stopMD });
      await wait();
      const queuedCommand = terminal.executeStatelessCommandWhenIdle('TE', {
        stopMD: (screens) => {
          intermediateResult = screens;
          return true;
        },
      });

      const response = await queuedCommand;
      await activeCommand;
      await terminal.closeSession();

      expect(response).to.equal(intermediateResult);
      expect(executeCommand).not.to.have.been.calledWithMatch({ sessionToken, command: 'MD' });
    });
    it('Should return error when executing regular command during stateless command', async () => {
      executeCommand.withArgs(commandMatch('FIRST')).resolves(
        wait(20).then(() => terminalResponse('FIRST RESPONSE'))
      );
      const terminal = new TerminalService(getTerminalConfig(false));

      const statelessCommand = terminal.executeStatelessCommandWhenIdle('FIRST', { stopMD });
      await wait();

      try {
        await terminal.executeCommand('SECOND', { stopMD });
        throw new Error('Command has been executed while stateless command is active');
      } catch (err) {
        expect(err).to.be.an.instanceof(
          TerminalRuntimeError.TerminalIsBusy
        );
      }

      await statelessCommand;
      await terminal.closeSession();
    });
    it('Should return error when closing terminal with queued stateless commands', async () => {
      executeCommand.withArgs(commandMatch('FIRST')).resolves(
        wait(10).then(() => terminalResponse('FIRST RESPONSE'))
      );
      executeCommand.withArgs(commandMatch('SECOND')).resolves(
        wait(20).then(() => terminalResponse('SECOND RESPONSE'))
      );
      const terminal = new TerminalService(getTerminalConfig(false));

      const activeCommand = terminal.executeCommand('FIRST', { stopMD });
      await wait();
      const queuedCommand = terminal.executeStatelessCommandWhenIdle('SECOND', { stopMD });

      try {
        await terminal.closeSession();
        throw new Error('Terminal has been closed while stateless commands are queued');
      } catch (err) {
        expect(err).to.be.an.instanceof(
          TerminalRuntimeError.TerminalIsBusy
        );
      }

      expect(await activeCommand).to.equal('FIRST RESPONSE');

      try {
        await terminal.closeSession();
        throw new Error('Terminal has been closed while stateless queue is draining');
      } catch (err) {
        expect(err).to.be.an.instanceof(
          TerminalRuntimeError.TerminalIsBusy
        );
      }

      expect(await queuedCommand).to.equal('SECOND RESPONSE');
      await terminal.closeSession();

      expect(closeSession.callCount).to.equal(1);
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
