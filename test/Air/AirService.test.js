/*
  eslint-disable import/no-extraneous-dependencies
*/
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import { AirRuntimeError } from '../../src/Services/Air/AirErrors';

const responsesDir = path.join(__dirname, '..', 'FakeResponses', 'Air');
const auth = {
  username: 'USERNAME',
  password: 'PASSWORD',
  targetBranch: 'BRANCH',
};


describe('#AirService', () => {
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
