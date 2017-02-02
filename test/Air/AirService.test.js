/*
  eslint-disable import/no-extraneous-dependencies
*/
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import { AirRuntimeError } from '../../src/Services/Air/AirErrors';

const responsesDir = path.join(__dirname, '..', 'FakeResponses', 'Air');
const terminalResponsesDir = path.join(__dirname, '..', 'FakeResponses', 'Terminal');
const auth = {
  username: 'USERNAME',
  password: 'PASSWORD',
  targetBranch: 'BRANCH',
};


describe('#AirService', () => {
  describe('getPNRByTicketNumber', () => {
    it('should fail when ticket data not available by ticket number', (done) => {
      const response = fs.readFileSync(
        path.join(terminalResponsesDir, 'getTicketNotExists.txt')
      ).toString();
      const createTerminalService = () => ({
        // The only command is executed, no analyze needed
        executeCommand: () => Promise.resolve(response),
        closeSession: () => Promise.resolve(true),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        '../Terminal/Terminal': createTerminalService,
      });
      const service = createAirService({ auth });
      service.getPNRByTicketNumber({ ticketNumber: '0649902789000' })
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.GetPnrError);
          expect(err.causedBy).to.be.an.instanceof(AirRuntimeError.PnrParseError);
          done();
        });
    });
    it('should fail when something fails in executeCommand', (done) => {
      const createTerminalService = () => ({
        // The only command is executed, no analyze needed
        executeCommand: () => Promise.reject(new Error('Some error')),
        closeSession: () => Promise.resolve(true),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        '../Terminal/Terminal': createTerminalService,
      });
      const service = createAirService({ auth });
      service.getPNRByTicketNumber({ ticketNumber: '0649902789000' })
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.GetPnrError);
          expect(err.causedBy).to.be.an.instanceof(Error);
          done();
        });
    });
    it('should fail when something fails in closeSession', (done) => {
      const response = fs.readFileSync(
        path.join(terminalResponsesDir, 'getTicketNotExists.txt')
      ).toString();
      const createTerminalService = () => ({
        // The only command is executed, no analyze needed
        executeCommand: () => Promise.resolve(response),
        closeSession: () => Promise.reject(new Error('Some error')),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        '../Terminal/Terminal': createTerminalService,
      });
      const service = createAirService({ auth });
      service.getPNRByTicketNumber({ ticketNumber: '0649902789000' })
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.GetPnrError);
          expect(err.causedBy).to.be.an.instanceof(Error);
          done();
        });
    });
    it('should fail when no TerminalService enabled for uAPI credentials', (done) => {
      // @TODO: add test here, simulating TerminalService response when no access is allowed
      done();
    });
    it('should return PNR when response is OK', (done) => {
      const response = fs.readFileSync(
        path.join(terminalResponsesDir, 'getTicketVoid.txt')
      ).toString();
      const createTerminalService = () => ({
        // The only command is executed, no analyze needed
        executeCommand: () => Promise.resolve(response),
        closeSession: () => Promise.resolve(true),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        '../Terminal/Terminal': createTerminalService,
      });
      const service = createAirService({ auth });
      service.getPNRByTicketNumber({ ticketNumber: '0649902789376' })
        .then((pnr) => {
          expect(pnr).to.equal('8167L2');
          done();
        })
        .catch(err => done(err));
    });
  });
  describe('getTickets', () => {
    it('should throw an error when some function fails', (done) => {
      const AirService = () => ({
        importPNR: () => Promise.reject(new Error('Some error')),
        getTicket: () => Promise.reject(new Error('Some error')),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': AirService,
      });
      const service = createAirService({ auth });
      service.getTickets({ pnr: 'PNR001' })
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.UnableToRetrieveTickets);
          expect(err.causedBy).to.be.an.instanceof(Error);
          done();
        });
    });
    it('should work with right responses', (done) => {
      const importPNRVoidResponse = JSON.parse(
        fs.readFileSync(path.join(responsesDir, 'importPNR_VOID.json')).toString()
      );
      const getTicketVoidResponse = JSON.parse(
        fs.readFileSync(path.join(responsesDir, 'getTicket_VOID.json')).toString()
      );
      const AirService = () => ({
        importPNR: () => Promise.resolve(importPNRVoidResponse),
        getTicket: () => Promise.resolve(getTicketVoidResponse),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': AirService,
      });
      const service = createAirService({ auth });
      service.getTickets({ pnr: 'PNR001' })
        .then((response) => {
          expect(response).to.be.an('array');
        })
        .then(done)
        .catch(err => done(err.causedBy));
    });
  });
});
