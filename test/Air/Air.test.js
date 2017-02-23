/*
  eslint-disable import/no-extraneous-dependencies
*/
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import { AirRuntimeError } from '../../src/Services/Air/AirErrors';

const responsesDir = path.join(__dirname, '..', 'FakeResponses', 'Air');
const terminalResponsesDir = path.join(__dirname, '..', 'FakeResponses', 'Terminal');
const auth = {
  username: 'USERNAME',
  password: 'PASSWORD',
  targetBranch: 'BRANCH',
};


describe('#AirService', () => {
  describe('shop', () => {
    it('should check if correct function from service is called', () => {
      const searchLowFares = sinon.spy(() => {});
      const service = () => ({ searchLowFares });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).shop({});
      expect(searchLowFares.calledOnce).to.be.equal(true);
    });
  });

  describe('toQueue', () => {
    it('should check if correct function from service is called', () => {
      const gdsQueue = sinon.spy(() => {});
      const service = () => ({ gdsQueue });
      const auth = {};
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).toQueue({});
      expect(gdsQueue.calledOnce).to.be.equal(true);
    });
  });

  describe('book', () => {
    it('should check if correct function from service is called', () => {
      const params = {
        passengers: [],
        rule: 'RULE',
      };

      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy((options) => {
        expect(options.foo).to.be.equal(123);
        expect(options.ActionStatusType).to.be.equal('TAU');
        expect(options.rule).to.be.equal(params.rule);
        expect(options.passengers).to.be.equal(params.passengers);
        return Promise.resolve();
      });
      const cancelUR = sinon.spy(() => {});
      const service = () => ({ airPricePricingSolutionXML, createReservation });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).book(params).then(() => {
        expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
        expect(createReservation.calledOnce).to.be.equal(true);
        expect(cancelUR.calledOnce).to.be.equal(false);
      });
    });

    it('should call cancel ur if no valid fare', () => {
      const params = { passengers: [], rule: 'RULE' };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy((options) => {
        return Promise.reject(new AirRuntimeError.NoValidFare({
          'universal:UniversalRecord': { LocatorCode: 123 },
        }));
      });
      const cancelUR = sinon.spy((options) => {
        expect(options.LocatorCode).to.be.equal(123);
        return Promise.resolve();
      });
      const service = () => ({
        airPricePricingSolutionXML,
        createReservation,
        cancelUR,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).book(params).then(() => {
        expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
        expect(createReservation.calledOnce).to.be.equal(true);
        expect(cancelUR.calledOnce).to.be.equal(true);
      }).then(res => {
        throw new Error('Cant be success.');
      }).catch(err => {
        expect(err).to.be.instanceof(AirRuntimeError.NoValidFare);
      });
    });

    it('should call cancel ur if segment booking failed', () => {
      const params = { passengers: [], rule: 'RULE' };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy((options) => {
        return Promise.reject(new AirRuntimeError.SegmentBookingFailed({
          'universal:UniversalRecord': { LocatorCode: 123 },
        }));
      });
      const cancelUR = sinon.spy((options) => {
        expect(options.LocatorCode).to.be.equal(123);
        return Promise.resolve();
      });
      const service = () => ({
        airPricePricingSolutionXML,
        createReservation,
        cancelUR,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).book(params).then(() => {
        expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
        expect(createReservation.calledOnce).to.be.equal(true);
        expect(cancelUR.calledOnce).to.be.equal(true);
      }).then(res => {
        throw new Error('Cant be success.');
      }).catch(err => {
        expect(err).to.be.instanceof(AirRuntimeError.SegmentBookingFailed);
      });
    });

    it('should not call cancel ur if other error', () => {
      const params = { passengers: [], rule: 'RULE' };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy((options) => {
        return Promise.reject(new AirRuntimeError.TicketingFailed({
          'universal:UniversalRecord': { LocatorCode: 123 },
        }));
      });
      const cancelUR = sinon.spy((options) => {
        expect(options.LocatorCode).to.be.equal(123);
        return Promise.resolve();
      });
      const service = () => ({
        airPricePricingSolutionXML,
        createReservation,
        cancelUR,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).book(params).then(() => {
        expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
        expect(createReservation.calledOnce).to.be.equal(true);
        expect(cancelUR.calledOnce).to.be.equal(true);
      }).then(res => {
        throw new Error('Cant be success.');
      }).catch(err => {
        expect(err).to.be.instanceof(AirRuntimeError.TicketingFailed);
      });
    });
  });

  describe('importPNR', () => {
    it('should check if correct function from service is called', () => {
      const importPNR = sinon.spy(() => {});
      const service = () => ({ importPNR });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).importPNR({});
      expect(importPNR.calledOnce).to.be.equal(true);
    });
  });

  describe('ticket', () => {
    it('should check if correct function from service is called', () => {
      const params = { PNR: '123456' };

      const importPNR = sinon.spy(
        () => Promise.resolve([{ uapi_reservation_locator: 'ABCDEF' }])
      );
      const ticket = sinon.spy((options) => {
        expect(options.ReservationLocator).to.be.equal('ABCDEF');
        return Promise.resolve();
      });
      const foid = sinon.spy(() => {});
      const service = () => ({ importPNR, ticket, foid });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).ticket(params).then(() => {
        expect(importPNR.calledOnce).to.be.equal(true);
        expect(ticket.calledOnce).to.be.equal(true);
        expect(foid.calledOnce).to.be.equal(false);
      });
    });

    it('should resolve foid and reticket', () => {
      const params = { PNR: '123456' };

      const importPNR = sinon.spy(
        () => Promise.resolve([{ uapi_reservation_locator: 'ABCDEF' }])
      );
      const ticketResponses = [
        Promise.resolve(),
        Promise.reject(new AirRuntimeError.TicketingFoidRequired([1])),
      ];

      const ticket = sinon.spy((options) => {
        expect(options.ReservationLocator).to.be.equal('ABCDEF');
        return ticketResponses.pop();
      });

      const foid = sinon.spy(() => {});
      const service = () => ({ importPNR, ticket, foid });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).ticket(params).then(() => {
        throw new Error('Cant be successfull');
      }).catch(err => {
        expect(importPNR.calledTwice).to.be.equal(true);
        expect(ticket.calledTwice).to.be.equal(true);
        expect(foid.calledOnce).to.be.equal(true);
      });
    });

    it('should resolve rethrow other errors', () => {
      const params = { PNR: '123456' };

      const importPNR = sinon.spy(
        () => Promise.resolve([{ uapi_reservation_locator: 'ABCDEF' }])
      );
      const ticketResponses = [
        Promise.reject(new AirRuntimeError.NoValidFare()),
      ];

      const ticket = sinon.spy((options) => {
        expect(options.ReservationLocator).to.be.equal('ABCDEF');
        return ticketResponses.pop();
      });

      const foid = sinon.spy(() => {});
      const service = () => ({ importPNR, ticket, foid });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).ticket(params).then(() => {
        throw new Error('Cant be successfull');
      }).catch(err => {
        expect(importPNR.calledOnce).to.be.equal(true);
        expect(ticket.calledOnce).to.be.equal(true);
        expect(foid.calledOnce).to.be.equal(false);
      });
    });
  });

  describe('flightInfo', () => {
    it('should check if correct function from service is called', () => {
      const flightInfo = sinon.spy((options) => {
        expect(options.flightInfoCriteria).to.be.an('array');
      });

      const service = () => ({ flightInfo });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).flightInfo({});
      expect(flightInfo.calledOnce).to.be.equal(true);
    });

    it('should check if correct function from service is called with array params', () => {
      const flightInfo = sinon.spy((options) => {
        expect(options.flightInfoCriteria).to.be.an('array');
      });

      const service = () => ({ flightInfo });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).flightInfo([{}]);
      expect(flightInfo.calledOnce).to.be.equal(true);
    });
  });

  describe('getTicket', () => {
    it('should fail when no itinerary present to import', (done) => {
      const AirService = () => ({
        getTicket: () => Promise.reject(new AirRuntimeError.TicketInfoIncomplete()),
        importPNR: () => Promise.reject(new AirRuntimeError()),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': AirService,
      });
      const service = createAirService({ auth });
      service.getTicket({ ticketNumber: '0649902789376' })
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError);
          done();
        });
    });

    it('should test if getPNRByTicketNumber is called when not complete', () => {
      const params = { ticketNumber: 123 };

      const getTicketResults = [
        Promise.resolve(),
        Promise.reject(new AirRuntimeError.TicketInfoIncomplete()),
      ];

      const getTicket = sinon.spy(() => {
        return getTicketResults.pop();
      });

      const getPNRByTicketNumber = sinon.spy((options) => {
        expect(options.ticketNumber).to.be.equal(123);
        return Promise.resolve('PNR');
      });

      const importPNR = sinon.spy((options) => {
        expect(options.pnr).to.be.equal('PNR');
        return Promise.resolve(params);
      });

      const service = () => ({
        getTicket,
        importPNR,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      const AirService = createAirService({ auth });
      AirService.getPNRByTicketNumber = getPNRByTicketNumber.bind(AirService);

      return AirService.getTicket(params).then(() => {
        expect(getTicket.calledTwice).to.be.equal(true);
        expect(getPNRByTicketNumber.calledOnce).to.be.equal(true);
        expect(importPNR.calledOnce).to.be.equal(true);
      });

    });
  });

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
      const createTerminalService = () => ({
        // The only command is executed, no analyze needed
        executeCommand: () => Promise.resolve(true),
        closeSession: () => Promise.reject(new Error('Some error')),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        '../Terminal/Terminal': createTerminalService,
      });
      const service = createAirService({ auth });
      service.getPNRByTicketNumber({ ticketNumber: '0649902789000' })
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(Error);
          done();
        });
    });
    it('should fail when no TerminalService enabled for uAPI credentials');
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

  describe('searchBookingsByPassengerName', () => {
    it('should check if list correctly parsed', () => {
      const returnList = sinon.spy(() => {
        return Promise.resolve('listscreen');
      });

      const returnBooking = sinon.spy(() => {
        return Promise.resolve('pnrscreen');
      });

      const executeCommand = sinon.spy((command) => {
        expect(command).to.be.a('string');
        expect(command.match(/\*-?.*/)).to.be.not.equal(null);
        if (command[1] === '-') {
          return returnList();
        }
        return returnBooking();
      });

      const closeSession = sinon.spy(() => Promise.resolve());

      const bookingPnr = sinon.spy(
        (screen) => (screen === 'pnrscreen') ? '123QWE' : null
      );

      const searchPassengersList = sinon.spy(
        (screen) => (screen === 'listscreen')
          ? [{ id: 1, name: 'first' }, { id: 2, name: 'last' }]
          : null,
      );


      const createAirService = proxyquire('../../src/Services/Air/Air', {
        '../../utils': {
          parsers: {
            bookingPnr,
            searchPassengersList,
          },
        },
        '../Terminal/Terminal': () => ({
          executeCommand,
          closeSession,
        }),
      });

      return createAirService({ auth })
        .searchBookingsByPassengerName({ searchPhrase: 'OK' })
        .then(res => {
          expect(res.type).to.be.equal('list');
          expect(res.data.length).to.be.equal(2);
          expect(res.data[0].pnr).to.be.equal('123QWE');
          expect(res.data[0].name).to.be.equal('first');
          expect(returnList.callCount).to.be.equal(3);
          expect(bookingPnr.callCount).to.be.equal(2);
          expect(searchPassengersList.callCount).to.be.equal(1);
          expect(returnBooking.calledTwice).to.be.equal(true);
          expect(executeCommand.callCount).to.be.equal(5);
          expect(closeSession.callCount).to.be.equal(3);
        });

    });

    it('should check if pnr parsed when list is null', () => {
      const returnBooking = sinon.spy(() => {
        return Promise.resolve('pnrscreen');
      });

      const executeCommand = sinon.spy((command) => {
        return returnBooking();
      });

      const bookingPnr = sinon.spy(
        (screen) => (screen === 'pnrscreen') ? '123QWE' : null
      );

      const searchPassengersList = sinon.spy(
        (screen) => (screen === 'listscreen')
          ? [{ id: 1, name: 'first' }, { id: 2, name: 'last' }]
          : null,
      );


      const createAirService = proxyquire('../../src/Services/Air/Air', {
        '../../utils': {
          parsers: {
            bookingPnr,
            searchPassengersList,
          },
        },
        '../Terminal/Terminal': () => ({
          executeCommand,
          closeSession: () => Promise.resolve(),
        }),
      });

      return createAirService({ auth })
        .searchBookingsByPassengerName({ searchPhrase: 'OK' })
        .then(res => {
          expect(res.type).to.be.equal('pnr');
          expect(res.data).to.be.equal('123QWE');
          expect(bookingPnr.callCount).to.be.equal(1);
          expect(searchPassengersList.callCount).to.be.equal(1);
          expect(returnBooking.calledOnce).to.be.equal(true);
          expect(executeCommand.calledOnce).to.be.equal(true);
        });
    });

    it('should check if pnr parsed when list is null', () => {
      const returnList = sinon.spy(() => {
        return Promise.resolve({});
      });

      const executeCommand = sinon.spy((command) => {
        return returnList();
      });

      const parseAny = () => [{ id: 1, name: 'first' }, { id: 2, name: 'last' }];

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        '../../utils': {
          parsers: {
            bookingPnr: parseAny,
            searchPassengersList: parseAny,
          },
        },
        '../Terminal/Terminal': () => ({
          executeCommand,
          closeSession: () => Promise.resolve(),
        }),
      });

      return createAirService({ auth })
        .searchBookingsByPassengerName({ searchPhrase: 'OK' })
        .then(res => Promise.reject(new Error('Cant be answer.')))
        .catch(err => {
          expect(err instanceof AirRuntimeError.RequestInconsistency)
            .to.be.equal(true);
        });
    });
  });
});
