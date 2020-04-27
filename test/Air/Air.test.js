const fs = require('fs');
const path = require('path');
const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const assert = require('assert');
const moment = require('moment');
const auth = require('../testconfig');
const { AirRuntimeError } = require('../../src/Services/Air/AirErrors');

const { expect } = chai;
chai.use(sinonChai);

const responsesDir = path.join(__dirname, '..', 'FakeResponses', 'Air');
const terminalResponsesDir = path.join(__dirname, '..', 'FakeResponses', 'Terminal');


describe('#AirService', () => {
  const getURByPNRSampleBooked = [
    {
      pnr: 'PNR002',
    }, {
      pnr: 'PNR001',
    },
  ];
  const getURbyPNRSampleTicketed = [
    {
      pnr: 'PNR001',
      uapi_ur_locator: 'UAPI01',
      uapi_reservation_locator: 'ABCDEF',
      ticketNumber: 123,
      tickets: [
        { number: '1234567890123' },
        { number: '1234567890456' },
      ],
    },
  ];
  const getURbyPNRSampleTicketedWithEmptyTickets = [
    {
      pnr: 'PNR001',
      uapi_ur_locator: 'UAPI01',
      uapi_reservation_locator: 'ABCDEF',
      ticketNumber: 123,
      tickets: [],
    },
  ];
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

    it('should check if correct function from service is called with async option', () => {
      const searchLowFaresAsync = sinon.spy(() => {});
      const service = () => ({ searchLowFaresAsync });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).shop({ async: true });
      expect(searchLowFaresAsync.calledOnce).to.be.equal(true);
    });
  });

  describe('retrieveShop', () => {
    it('should check if correct function from service is called', () => {
      const searchLowFaresRetrieve = sinon.spy(() => {});
      const service = () => ({ searchLowFaresRetrieve });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).retrieveShop({});
      expect(searchLowFaresRetrieve.calledOnce).to.be.equal(true);
    });
  });

  describe('availability', () => {
    it('should check if correct function from service is called', () => {
      const availability = sinon.spy(() => {});
      const service = () => ({ availability });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).availability({});
      expect(availability.calledOnce).to.be.equal(true);
    });
  });

  describe('addSegments', () => {
    it('should check if correct function from service is called', () => {
      const addSegments = sinon.spy(() => {});
      const service = () => ({ addSegments });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).addSegments({
        version: 1,
        universalRecordLocatorCode: 'CODE',
        reservationLocatorCode: 'CODE'
      });
      expect(addSegments.calledOnce).to.be.equal(true);
    });
    it('should check if correct function from service is called when no details provided', () => {
      const addSegments = sinon.spy(() => {});
      const getBooking = sinon.spy(() => {});
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve([{ pnr: 'PNR000' }]));
      const service = () => ({ addSegments, getBooking, getUniversalRecordByPNR });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).addSegments({ pnr: 'PNR000' });
      expect(getUniversalRecordByPNR.calledOnce).to.be.equal(true);
    });
  });

  describe('toQueue', () => {
    it('should check if correct function from service is called', () => {
      const gdsQueue = sinon.spy(() => {});
      const service = () => ({ gdsQueue });
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

    it('should check if book is called correctly with TAU option provided', () => {
      const params = {
        passengers: [],
        rule: 'RULE',
        tau: '2020-02-08 09:30',
      };

      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy((options) => {
        expect(options.foo).to.be.equal(123);
        expect(options.ActionStatusType).to.be.equal('TAU');
        expect(options.rule).to.be.equal(params.rule);
        expect(options.passengers).to.be.equal(params.passengers);
        expect(options.tau).to.be.equal(params.tau);
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
      const params = { passengers: [], rule: 'RULE', allowWaitlist: true };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy(
        () => Promise.reject(new AirRuntimeError.NoValidFare({
          'universal:UniversalRecord': { LocatorCode: 123 },
        }))
      );
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

      return createAirService({ auth }).book(params)
        .then(() => {
          throw new Error('Cant be success.');
        })
        .catch((err) => {
          expect(err).to.be.instanceof(AirRuntimeError.NoValidFare);
          expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
          expect(createReservation.calledOnce).to.be.equal(true);
          expect(cancelUR.calledOnce).to.be.equal(true);
        });
    });

    it('should call cancel ur if segment booking failed', () => {
      const params = { passengers: [], rule: 'RULE', allowWaitlist: true };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy(
        () => Promise.reject(new AirRuntimeError.SegmentBookingFailed({
          'universal:UniversalRecord': { LocatorCode: 123 },
        }))
      );
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

      return createAirService({ auth }).book(params)
        .then(() => {
          throw new Error('Cant be success.');
        })
        .catch((err) => {
          expect(err).to.be.instanceof(AirRuntimeError.SegmentBookingFailed);
          expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
          expect(createReservation.calledOnce).to.be.equal(true);
          expect(cancelUR.calledOnce).to.be.equal(true);
        });
    });

    it('should not call cancel ur if other error', () => {
      const params = { passengers: [], rule: 'RULE', allowWaitlist: true };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy(
        () => Promise.reject(new AirRuntimeError.TicketingFailed({
          'universal:UniversalRecord': { LocatorCode: 123 },
        }))
      );
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

      return createAirService({ auth }).book(params)
        .then(() => {
          throw new Error('Cant be success.');
        })
        .catch((err) => {
          expect(err).to.be.instanceof(AirRuntimeError.TicketingFailed);
          expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
          expect(createReservation.calledOnce).to.be.equal(true);
          expect(cancelUR.calledOnce).to.be.equal(false);
        });
    });

    it('should not call cancel ur if segment booking failed with SegmentBookingFailed or NoValidFare but restrictWaitlist=true', () => {
      const params = { passengers: [], rule: 'RULE', allowWaitlist: false };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy(
        () => Promise.reject(new AirRuntimeError.SegmentBookingFailed({
          detail: { },
        }))
      );
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

      return createAirService({ auth }).book(params)
        .then(() => {
          throw new Error('Cant be success.');
        })
        .catch((err) => {
          expect(err).to.be.instanceof(AirRuntimeError.SegmentBookingFailed);
          expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
          expect(createReservation.calledOnce).to.be.equal(true);
          expect(cancelUR).to.have.callCount(0);
        });
    });

    it('should not call cancel ur if segment booking failed with NoValidFare but restrictWaitlist=true', () => {
      const params = { passengers: [], rule: 'RULE', allowWaitlist: false };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy(() => Promise.reject(new AirRuntimeError.NoValidFare({
        detail: { },
      })));
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

      return createAirService({ auth }).book(params)
        .then(() => {
          throw new Error('Cant be success.');
        })
        .catch((err) => {
          expect(err).to.be.instanceof(AirRuntimeError.NoValidFare);
          expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
          expect(createReservation.calledOnce).to.be.equal(true);
          expect(cancelUR).to.have.callCount(0);
        });
    });

    it('should not call cancel ur if segment booking failed with other error and restrictWaitlist=true', () => {
      const params = { passengers: [], rule: 'RULE', allowWaitlist: false };
      const airPricePricingSolutionXML = sinon.spy(
        () => Promise.resolve({ foo: 123 })
      );
      const createReservation = sinon.spy(
        () => Promise.reject(new AirRuntimeError.SegmentWaitlisted({
          detail: { },
        }))
      );
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

      return createAirService({ auth }).book(params)
        .then(() => {
          throw new Error('Cant be success.');
        })
        .catch((err) => {
          expect(err).to.be.instanceof(AirRuntimeError.SegmentWaitlisted);
          expect(airPricePricingSolutionXML.calledOnce).to.be.equal(true);
          expect(createReservation.calledOnce).to.be.equal(true);
          expect(cancelUR).to.have.callCount(0);
        });
    });
  });

  describe('retrieve UR', () => {
    it('should check if correct function from service is called', () => {
      const getUniversalRecord = sinon.spy(() => {});
      const service = () => ({ getUniversalRecord });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).getUniversalRecord({});
      expect(getUniversalRecord.calledOnce).to.be.equal(true);
    });
  });

  describe('importBooking', () => {
    const params = {
      pnr: 'PNR001',
    };
    const segment = {
      date: moment().add(42, 'days').format('DDMMM'),
      airline: 'OK',
      from: 'DOH',
      to: 'ODM',
      comment: 'NO1',
      class: 'Y',
    };
    const pnrString = `${params.pnr}/`;
    const segmentResult = (
      `1. ${segment.airline} OPEN ${segment.class}  ${segment.date} ${segment.from}${segment.to} ${segment.comment}`
    ).toUpperCase();

    it('should check if correct function from service is called', () => {
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve({}));
      const airService = () => ({ getUniversalRecordByPNR });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });
      return createAirService({ auth })
        .getUniversalRecordByPNR(params)
        .then(() => {
          expect(getUniversalRecordByPNR).to.have.callCount(1);
        });
    });
    it('should throw an error when something is wrong in parser', () => {
      const error = new Error('Some error');
      const getUniversalRecordByPNR = sinon.spy(() => Promise.reject(error));

      const airService = () => ({ getUniversalRecordByPNR });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });
      return createAirService({ auth })
        .getUniversalRecordByPNR(params)
        .catch((importError) => {
          expect(importError).to.equal(error);
        });
    });
    it('should throw an error when it is unable to open PNR in rerminal', () => {
      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.reject(new AirRuntimeError.NoReservationToImport())
      );
      const executeCommand = sinon.stub();
      executeCommand.onCall(0).returns(
        Promise.resolve('FINISH OR IGNORE')
      );
      const closeSession = sinon.spy(
        () => Promise.resolve(true)
      );

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
      });
      const terminalService = () => ({
        executeCommand,
        closeSession,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
        '../Terminal/Terminal': terminalService,
      });

      return createAirService({ auth })
        .getUniversalRecordByPNR(params)
        .catch((error) => {
          expect(error).to.be.an.instanceOf(AirRuntimeError.UnableToImportPnr);
          expect(error.causedBy).to.be.an.instanceOf(AirRuntimeError.UnableToOpenPNRInTerminal);
          expect(getUniversalRecordByPNR).to.have.callCount(1);
          expect(executeCommand).to.have.callCount(1);
          expect(closeSession).to.have.callCount(1);
        });
    });
    it('should throw an error when it is unable to add an extra segment', () => {
      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.reject(new AirRuntimeError.NoReservationToImport())
      );
      const executeCommand = sinon.stub();
      executeCommand.onCall(0).returns(
        Promise.resolve(pnrString)
      );
      executeCommand.onCall(1).returns(
        Promise.resolve('ERR: FORMAT')
      );
      const closeSession = sinon.spy(
        () => Promise.resolve(true)
      );

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
      });
      const terminalService = () => ({
        executeCommand,
        closeSession,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
        '../Terminal/Terminal': terminalService,
      });

      return createAirService({ auth })
        .getUniversalRecordByPNR(params)
        .catch((error) => {
          expect(error).to.be.an.instanceOf(AirRuntimeError.UnableToImportPnr);
          expect(error.causedBy).to.be.an.instanceOf(AirRuntimeError.UnableToAddExtraSegment);
          expect(getUniversalRecordByPNR).to.have.callCount(1);
          expect(executeCommand).to.have.callCount(2);
          expect(closeSession).to.have.callCount(1);
        });
    });
    it('should throw an error when it is unable to add an extra segment (no segment added)', () => {
      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.reject(new AirRuntimeError.NoReservationToImport())
      );
      const executeCommand = sinon.stub();
      executeCommand.onCall(0).returns(
        Promise.resolve(pnrString)
      );
      executeCommand.onCall(1).returns(
        Promise.resolve(segmentResult)
      );
      executeCommand.onCall(2).returns(
        Promise.resolve(true)
      );
      executeCommand.onCall(3).returns(
        Promise.resolve(true)
      );
      executeCommand.onCall(4).returns(
        Promise.resolve([
          pnrString,
        ].join('\n'))
      );
      const closeSession = sinon.spy(
        () => Promise.resolve(true)
      );

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
      });
      const terminalService = () => ({
        executeCommand,
        closeSession,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
        '../Terminal/Terminal': terminalService,
      });

      return createAirService({ auth })
        .getUniversalRecordByPNR(params)
        .catch((error) => {
          expect(error).to.be.an.instanceOf(AirRuntimeError.UnableToImportPnr);
          expect(error.causedBy).to.be.an.instanceOf(
            AirRuntimeError.UnableToSaveBookingWithExtraSegment
          );
          expect(getUniversalRecordByPNR).to.have.callCount(1);
          expect(executeCommand).to.have.callCount(5);
          expect(closeSession).to.have.callCount(1);
        });
    });
    it('should throw an error when it is unable to add an extra segment (no PNR parsed)', () => {
      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.reject(new AirRuntimeError.NoReservationToImport())
      );
      const executeCommand = sinon.stub();
      executeCommand.onCall(0).returns(
        Promise.resolve(pnrString)
      );
      executeCommand.onCall(1).returns(
        Promise.resolve(segmentResult)
      );
      executeCommand.onCall(2).returns(
        Promise.resolve(true)
      );
      executeCommand.onCall(3).returns(
        Promise.resolve(true)
      );
      executeCommand.onCall(4).returns(
        Promise.resolve([
          segmentResult,
        ].join('\n'))
      );
      const closeSession = sinon.spy(
        () => Promise.resolve(true)
      );

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
      });
      const terminalService = () => ({
        executeCommand,
        closeSession,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
        '../Terminal/Terminal': terminalService,
      });

      return createAirService({ auth })
        .getUniversalRecordByPNR(params)
        .catch((error) => {
          expect(error).to.be.an.instanceOf(AirRuntimeError.UnableToImportPnr);
          expect(error.causedBy).to.be.an.instanceOf(
            AirRuntimeError.UnableToSaveBookingWithExtraSegment
          );
          expect(getUniversalRecordByPNR).to.have.callCount(1);
          expect(executeCommand).to.have.callCount(5);
          expect(closeSession).to.have.callCount(1);
        });
    });

    it('should run to the end if everything is OK', () => {
      const getUniversalRecordByPNR = sinon.stub();
      getUniversalRecordByPNR.onCall(0).returns(
        Promise.reject(new AirRuntimeError.NoReservationToImport())
      );
      getUniversalRecordByPNR.onCall(1).returns(Promise.resolve(getURByPNRSampleBooked));
      getUniversalRecordByPNR.onCall(2).returns(Promise.resolve(getURByPNRSampleBooked));
      const cancelBooking = sinon.spy(() => Promise.resolve(true));
      const executeCommand = sinon.stub();
      executeCommand.onCall(0).returns(
        Promise.resolve(pnrString)
      );
      executeCommand.onCall(1).returns(
        Promise.resolve(segmentResult)
      );
      executeCommand.onCall(2).returns(
        Promise.resolve(true)
      );
      executeCommand.onCall(3).returns(
        Promise.resolve(true)
      );
      executeCommand.onCall(4).returns(
        Promise.resolve([
          pnrString,
          segmentResult,
        ].join('\n'))
      );
      const closeSession = sinon.spy(
        () => Promise.resolve(true)
      );

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        cancelBooking,
      });
      const terminalService = () => ({
        executeCommand,
        closeSession,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
        '../Terminal/Terminal': terminalService,
      });

      return createAirService({ auth })
        .getUniversalRecordByPNR(params)
        .catch((error) => {
          expect(error).to.be.an.instanceOf(AirRuntimeError.UnableToImportPnr);
          expect(error.causedBy).to.be.an.instanceOf(
            AirRuntimeError.UnableToSaveBookingWithExtraSegment
          );
          expect(getUniversalRecordByPNR).to.have.callCount(1);
          expect(executeCommand).to.have.callCount(5);
          expect(closeSession).to.have.callCount(1);
        });
    });
  });

  describe('ticket', () => {
    it('should check if correct function from service is called', () => {
      const params = { pnr: 'PNR001' };

      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.resolve(getURbyPNRSampleTicketed)
      );
      const ticket = sinon.spy((options) => {
        expect(options.ReservationLocator).to.be.equal('ABCDEF');
        return Promise.resolve();
      });
      const foid = sinon.spy(() => {});
      const service = () => ({ getUniversalRecordByPNR, ticket, foid });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).ticket(params).then(() => {
        expect(getUniversalRecordByPNR.calledOnce).to.be.equal(true);
        expect(ticket.calledOnce).to.be.equal(true);
        expect(foid.calledOnce).to.be.equal(false);
      });
    });

    it('should resolve foid and reticket', () => {
      const params = { pnr: 'PNR001' };

      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.resolve(getURbyPNRSampleTicketed)
      );
      const ticketResponses = [
        Promise.resolve(),
        Promise.reject(new AirRuntimeError.TicketingFoidRequired([1])),
      ];

      const ticket = sinon.spy((options) => {
        expect(options.ReservationLocator).to.be.equal('ABCDEF');
        return ticketResponses.pop();
      });

      const foid = sinon.spy(() => Promise.resolve({}));
      const service = () => ({ getUniversalRecordByPNR, ticket, foid });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).ticket(params).then(() => {
        expect(getUniversalRecordByPNR.calledTwice).to.be.equal(true);
        expect(ticket.calledTwice).to.be.equal(true);
        expect(foid.calledOnce).to.be.equal(true);
      });
    });

    it('should retry ticketing if PNR busy', function () {
      this.timeout(3000);
      const params = { pnr: 'PNR001' };

      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.resolve(getURbyPNRSampleTicketed)
      );
      const ticketResponses = [
        Promise.resolve(),
        Promise.reject(new AirRuntimeError.TicketingPNRBusy([1])),
      ];

      const ticket = sinon.spy((options) => {
        expect(options.ReservationLocator).to.be.equal('ABCDEF');
        return ticketResponses.pop();
      });

      const service = () => ({ getUniversalRecordByPNR, ticket });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth, debug: 1 }).ticket(params).then(() => {
        expect(getUniversalRecordByPNR.calledOnce).to.be.equal(true);
        expect(ticket.calledTwice).to.be.equal(true);
      });
    });


    it('should set FOID and retry ticketing if PNR busy', function () {
      this.timeout(5000);
      const params = { pnr: 'PNR001' };

      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.resolve(getURbyPNRSampleTicketed)
      );
      const ticketResponses = [
        () => Promise.resolve(),
        () => Promise.reject(new AirRuntimeError.TicketingPNRBusy()),
        () => Promise.reject(new AirRuntimeError.TicketingFoidRequired()),
      ];

      const ticket = sinon.spy((options) => {
        expect(options.ReservationLocator).to.be.equal('ABCDEF');
        return ticketResponses.pop()();
      });

      const foid = sinon.spy(() => Promise.resolve({}));
      const service = () => ({ getUniversalRecordByPNR, ticket, foid });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth, debug: 1 }).ticket(params).then(() => {
        expect(getUniversalRecordByPNR.callCount).to.be.equal(2);
        expect(foid.calledOnce).to.be.equal(true);
        expect(ticket.callCount).to.be.equal(3);
      });
    });

    it('should resolve rethrow other errors', () => {
      const params = { pnr: 'PNR001' };

      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.resolve(getURbyPNRSampleTicketed)
      );
      const ticketResponses = [
        Promise.reject(new AirRuntimeError.NoValidFare()),
      ];

      const ticket = sinon.spy((options) => {
        expect(options.ReservationLocator).to.be.equal('ABCDEF');
        return ticketResponses.pop();
      });

      const foid = sinon.spy(() => {});
      const service = () => ({ getUniversalRecordByPNR, ticket, foid });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth }).ticket(params).then(() => {
        throw new Error('Cant be successfull');
      }).catch(() => {
        expect(getUniversalRecordByPNR.calledOnce).to.be.equal(true);
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
    it('should fail when no itinerary present to import', () => {
      const AirService = () => ({
        getUniversalRecordByPNR: () => Promise.reject(new AirRuntimeError()),
        getTicket: () => Promise.reject(new AirRuntimeError.TicketInfoIncomplete()),
        importBooking: () => Promise.reject(new AirRuntimeError()),
      });
      const createTerminalService = () => ({
        executeCommand: () => Promise.resolve('RLOC 1G PNR001'),
        closeSession: () => Promise.resolve(true),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': AirService,
        '../Terminal/Terminal': createTerminalService,
      });
      const service = createAirService({ auth });
      service.getTicket({ ticketNumber: '0649902789376' })
        .then(() => Promise.reject(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError);
        });
    });

    it('should get ticket data if duplicate ticket found', () => {
      const getTicket = sinon.stub();
      getTicket.onCall(0).returns(
        Promise.reject(new AirRuntimeError.DuplicateTicketFound())
      );
      getTicket.onCall(1).returns(
        Promise.resolve({
          pnr: 'PNR001',
          ticketNumber: '1234567890123',
        })
      );
      // Spies
      const cancelTicket = sinon.spy(() => Promise.resolve(true));
      const getBookingByTicketNumber = sinon.spy(() => Promise.resolve('PNR001'));
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURbyPNRSampleTicketed));
      // Services
      const service = () => ({
        getTicket,
        cancelTicket,
        getUniversalRecordByPNR,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      const AirService = createAirService({ auth });
      AirService.getBookingByTicketNumber = getBookingByTicketNumber.bind(AirService);

      return AirService.getTicket({ ticketNumber: '0649902789376' })
        .then((res) => {
          expect(res).to.be.an('object').and.to.have.property('ticketNumber');
          expect(res.ticketNumber).to.equal('1234567890123');
          expect(getTicket.calledTwice).to.be.equal(true);
          expect(getBookingByTicketNumber.calledOnce).to.be.equal(true);
          expect(getUniversalRecordByPNR.calledOnce).to.be.equal(true);
        });
    });

    it('should test if getBookingByTicketNumber is called when not complete', () => {
      const params = { ticketNumber: 123, pnr: 'PNR001' };

      const getTicketResults = [
        Promise.resolve(),
        Promise.reject(new AirRuntimeError.TicketInfoIncomplete()),
      ];

      const getTicket = sinon.spy(() => getTicketResults.pop());

      const getBookingByTicketNumber = sinon.spy((options) => {
        expect(options.ticketNumber).to.be.equal(123);
        return Promise.resolve('PNR001');
      });

      const getUniversalRecordByPNR = sinon.spy((options) => {
        expect(options.pnr).to.be.equal('PNR001');
        return Promise.resolve(getURbyPNRSampleTicketed);
      });

      const service = () => ({
        getTicket,
        getUniversalRecordByPNR,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      const AirService = createAirService({ auth });
      AirService.getBookingByTicketNumber = getBookingByTicketNumber.bind(AirService);
      AirService.importBooking = getUniversalRecordByPNR.bind(AirService);

      return AirService.getTicket(params).then(() => {
        expect(getTicket.calledTwice).to.be.equal(true);
        expect(getBookingByTicketNumber.calledOnce).to.be.equal(true);
        expect(getUniversalRecordByPNR.calledOnce).to.be.equal(true);
      });
    });
  });

  describe('getBookingByTicketNumber', () => {
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
      service.getBookingByTicketNumber({ ticketNumber: '0649902789000' })
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
      service.getBookingByTicketNumber({ ticketNumber: '0649902789000' })
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
      service.getBookingByTicketNumber({ ticketNumber: '0649902789000' })
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
      service.getBookingByTicketNumber({ ticketNumber: '0649902789376' })
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
        getUniversalRecordByPNR: () => Promise.resolve({ uapi_reservation_locator: 'RLC001' }),
        getTickets: () => Promise.reject(new Error('Some error')),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': AirService,
      });
      const service = createAirService({ auth });

      service.getTickets({ uapi_reservation_locator: 'RLC001' })
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.UnableToRetrieveTickets);
          expect(err.causedBy).to.be.an.instanceof(Error);
          done();
        });
    });
    it('should work with right responses', (done) => {
      const importBookingVoidResponse = JSON.parse(
        fs.readFileSync(path.join(responsesDir, 'importBooking_VOID.json')).toString()
      );
      const getTicketVoidResponse = JSON.parse(
        fs.readFileSync(path.join(responsesDir, 'getTicket_VOID.json')).toString()
      );
      const AirService = () => ({
        getUniversalRecordByPNR: () => Promise.resolve(importBookingVoidResponse),
        getTickets: () => Promise.resolve(getTicketVoidResponse),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': AirService,
      });
      const service = createAirService({ auth });
      service.getTickets({ pnr: 'XDQTZ4' })
        .then((response) => {
          expect(response).to.be.an('array');
        })
        .then(done)
        .catch(err => done(err.causedBy));
    });
  });

  describe('searchBookingsByPassengerName', () => {
    it('should check if list correctly parsed', () => {
      const returnList = sinon.spy(() => Promise.resolve('listscreen'));
      const returnBooking = sinon.spy(() => Promise.resolve('pnrscreen'));

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
        screen => ((screen === 'pnrscreen') ? '123QWE' : null)
      );

      const searchPassengersList = sinon.spy(
        screen => (
          (screen === 'listscreen')
            ? [{ id: 1, name: 'first' }, { id: 2, name: 'last' }]
            : null
        )
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
        .then((res) => {
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
      const returnBooking = sinon.spy(() => Promise.resolve('pnrscreen'));
      const executeCommand = sinon.spy(() => returnBooking());

      const bookingPnr = sinon.spy(
        screen => ((screen === 'pnrscreen') ? '123QWE' : null)
      );

      const searchPassengersList = sinon.spy(
        screen => (
          (screen === 'listscreen')
            ? [{ id: 1, name: 'first' }, { id: 2, name: 'last' }]
            : null
        )
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
        .then((res) => {
          expect(res.type).to.be.equal('pnr');
          expect(res.data).to.be.equal('123QWE');
          expect(bookingPnr.callCount).to.be.equal(1);
          expect(searchPassengersList.callCount).to.be.equal(1);
          expect(returnBooking.calledOnce).to.be.equal(true);
          expect(executeCommand.calledOnce).to.be.equal(true);
        });
    });

    it('should check if pnr parsed when list is null', () => {
      const returnList = sinon.spy(() => Promise.resolve({}));
      const executeCommand = sinon.spy(() => returnList());

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
        .then(() => Promise.reject(new Error('Cant be answer.')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.RequestInconsistency);
        });
    });
  });

  describe('cancelTicket', () => {
    it('should throw a general error', () => {
      const service = () => ({
        getTicket: () => Promise.reject(new Error('Some error')),
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });

      return createAirService({ auth })
        .cancelTicket()
        .then(() => Promise.reject(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.FailedToCancelTicket);
          expect(err.causedBy).to.be.an.instanceof(Error);
        });
    });
    it('should cancel ticket if info is complete', () => {
      // Spies
      const getTicket = sinon.spy(() => Promise.resolve({
        pnr: 'PNR001',
        ticketNumber: '1234567890123',
      }));
      const cancelTicket = sinon.spy(() => Promise.resolve(true));
      // Services
      const airService = () => ({
        getTicket,
        cancelTicket,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      const service = createAirService({ auth });

      return service.cancelTicket({
        ticketNumber: '1234567890123',
      })
        .then(() => {
          expect(getTicket).to.have.callCount(1);
          expect(cancelTicket).to.have.callCount(1);
        });
    });
    it('should get ticket data if incomplete and be OK', () => {
      // Get ticket stub to return 2 different values on different calls
      const getTicket = sinon.stub();
      getTicket.onCall(0).returns(
        Promise.reject(new AirRuntimeError.TicketInfoIncomplete())
      );
      getTicket.onCall(1).returns(
        Promise.resolve({
          pnr: 'PNR001',
          ticketNumber: '1234567890123',
        })
      );
      // Spies
      const cancelTicket = sinon.spy(() => Promise.resolve(true));
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURByPNRSampleBooked));
      const executeCommand = sinon.spy(() => Promise.resolve('RLOC 1G PNR001'));
      const closeSession = sinon.spy(() => Promise.resolve(true));
      // Services
      const airService = () => ({
        getTicket,
        cancelTicket,
        getUniversalRecordByPNR,
      });
      const terminalService = () => ({
        executeCommand,
        closeSession,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
        '../Terminal/Terminal': terminalService,
      });

      const service = createAirService({ auth });

      return service.cancelTicket({
        ticketNumber: '1234567890123',
      })
        .then(() => {
          expect(getTicket).to.have.callCount(2);
          expect(cancelTicket).to.have.callCount(1);
          expect(getUniversalRecordByPNR).to.have.callCount(1);
          expect(executeCommand).to.have.callCount(1);
          expect(closeSession).to.have.callCount(1);
        });
    });
  });
  describe('cancelBooking', () => {
    it('should throw general error', () => {
      const airService = () => ({
        getUniversalRecordByPNR: () => Promise.resolve({ uapi_reservation_locator: 'RLC001' }),
        getTickets: () => Promise.reject(new Error('Some error')),
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
        })
        .then(() => Promise.reject(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.FailedToCancelPnr);
          expect(err.causedBy).to.be.an.instanceof(Error);
        });
    });
    it('should cancel PNR if no tickets available', () => {
      // Spies
      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.resolve(getURbyPNRSampleTicketedWithEmptyTickets)
      );
      const cancelBooking = sinon.spy(() => Promise.resolve(true));
      const getTicket = sinon.spy(() => Promise.resolve({
        coupons: [],
      }));

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        getTicket,
        cancelBooking,
        getTickets: () => Promise.resolve([]),
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
        })
        .then(() => {
          expect(getUniversalRecordByPNR).to.have.callCount(2);
          expect(getTicket).to.have.callCount(0);
          expect(cancelBooking).to.have.callCount(1);
        });
    });
    it('should cancel PNR if tickets have only VOID coupons', () => {
      // Spies
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURbyPNRSampleTicketed));
      const cancelBooking = sinon.spy(() => Promise.resolve(true));
      const getTickets = sinon.spy(() => Promise.resolve([{
        tickets: [{
          coupons: [{
            status: 'V',
          }, {
            status: 'V',
          }],
        }],
      }]));

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        getTickets,
        cancelBooking,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
        })
        .then(() => {
          expect(getUniversalRecordByPNR).to.have.callCount(2);
          expect(getTickets).to.have.callCount(1);
          expect(cancelBooking).to.have.callCount(1);
        });
    });
    it('should fail with AirRuntimeError.PNRHasOpenTickets PNR if tickets have OPEN coupons and no cancelTicket option', () => {
      const someTickets = [
        {
          tickets: [{
            coupons: [{
              status: 'V',
            }, {
              status: 'V',
            }],
          }],
        },
        {
          tickets: [{
            coupons: [{
              status: 'O',
            }, {
              status: 'O',
            }],
          }],
        },
      ];

      // Spies
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURbyPNRSampleTicketed));
      const cancelBooking = sinon.spy(() => Promise.resolve(true));
      const getTickets = sinon.spy(() => Promise.resolve(someTickets));

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        getTickets,
        cancelBooking,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
        })
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.FailedToCancelPnr);
          expect(err.causedBy).to.be.an.instanceof(AirRuntimeError.PNRHasOpenTickets);
          expect(getUniversalRecordByPNR).to.have.callCount(1);
          expect(getTickets).to.have.callCount(1);
          expect(cancelBooking).to.have.callCount(0);
        });
    });
    it('should succeed when there are no VOID, but REFUNDED tickets', () => {
      // Spies
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURbyPNRSampleTicketed));
      const cancelTicket = sinon.spy(() => Promise.resolve(true));
      const cancelBooking = sinon.spy(() => Promise.resolve(true));

      const getTickets = sinon.spy(() => Promise.resolve([
        {
          tickets: [{
            coupons: [{
              status: 'R',
            }, {
              status: 'R',
            }],
          }],
        },
      ]));

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        getTickets,
        cancelBooking,
        cancelTicket,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
        })
        .then(() => {
          expect(getUniversalRecordByPNR).to.have.callCount(2);
          expect(getTickets).to.have.callCount(1);
          expect(cancelBooking).to.have.callCount(1);
        });
    });
    it('should succeed when there are VOID and REFUNDED tickets', () => {
      // Spies
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURbyPNRSampleTicketed));
      const cancelTicket = sinon.spy(() => Promise.resolve(true));
      const cancelBooking = sinon.spy(() => Promise.resolve(true));

      const getTickets = sinon.spy(() => Promise.resolve([
        {
          tickets: [{
            coupons: [{
              status: 'R',
            }, {
              status: 'R',
            }],
          }],
        },
        {
          tickets: [{
            coupons: [{
              status: 'V',
            }, {
              status: 'V',
            }],
          }],
        },
      ]));

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        getTickets,
        cancelBooking,
        cancelTicket,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
        })
        .then(() => {
          expect(getUniversalRecordByPNR).to.have.callCount(2);
          expect(getTickets).to.have.callCount(1);
          expect(cancelBooking).to.have.callCount(1);
        });
    });
    it('should succeed when there are OPEN and VOID tickets and cancelTickets = true', () => {
      // Spies
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURbyPNRSampleTicketed));
      const cancelTicket = sinon.spy(() => Promise.resolve(true));
      const cancelBooking = sinon.spy(() => Promise.resolve(true));

      const getTickets = sinon.spy(() => Promise.resolve([
        {
          tickets: [{
            coupons: [{
              status: 'V',
            }, {
              status: 'V',
            }],
          }],
        },
        {
          tickets: [{
            coupons: [{
              status: 'O',
            }, {
              status: 'O',
            }],
          }, {
            coupons: [{
              status: 'V',
            }, {
              status: 'V',
            }],
          }],
        },
      ]));

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        getTickets,
        cancelBooking,
        cancelTicket,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
          cancelTickets: true,
        })
        .then(() => {
          expect(getUniversalRecordByPNR).to.have.callCount(2);
          expect(getTickets).to.have.callCount(1);
          expect(cancelBooking).to.have.callCount(1);
          expect(cancelTicket).to.have.callCount(1);
        });
    });
    it('should fail with AirRuntimeError.PNRHasOpenTickets PNR if tickets have coupons other than OPEN', () => {
      // Spies
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURbyPNRSampleTicketed));
      const cancelBooking = sinon.spy(() => Promise.resolve(true));
      const getTickets = sinon.spy(() => Promise.resolve([
        {
          tickets: [{
            coupons: [{
              status: 'V',
            }, {
              status: 'V',
            }],
          }],
        },
        {
          tickets: [{
            coupons: [{
              status: 'F',
            }, {
              status: 'A',
            }],
          }],
        },
      ]));

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        getTickets,
        cancelBooking,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
          cancelTickets: true,
        })
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.FailedToCancelPnr);
          expect(err.causedBy).to.be.an.instanceof(
            AirRuntimeError.UnableToCancelTicketStatusNotOpen
          );
          expect(getUniversalRecordByPNR).to.have.callCount(1);
          expect(getTickets).to.have.callCount(1);
          expect(cancelBooking).to.have.callCount(0);
        });
    });
    it('should cancel tickets and PNR if no errors occured', () => {
      // Spies
      const getUniversalRecordByPNR = sinon.spy(() => Promise.resolve(getURbyPNRSampleTicketed));
      const cancelTicket = sinon.spy(() => Promise.resolve(true));
      const cancelBooking = sinon.spy(() => Promise.resolve(true));
      const getTickets = sinon.spy(() => Promise.resolve([
        {
          tickets: [{
            coupons: [{
              status: 'V',
            }, {
              status: 'V',
            }],
          }],
        },
        {
          tickets: [{
            coupons: [{
              status: 'O',
            }, {
              status: 'O',
            }],
          }],
        },
      ]));

      // Services
      const airService = () => ({
        getUniversalRecordByPNR,
        getTickets,
        cancelBooking,
        cancelTicket,
      });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      return createAirService({ auth })
        .cancelBooking({
          pnr: 'PNR001',
          cancelTickets: true,
        })
        .then((result) => {
          expect(result).to.equal(true);
          expect(getUniversalRecordByPNR).to.have.callCount(2);
          expect(getTickets).to.have.callCount(1);
          expect(cancelTicket).to.have.callCount(1);
          expect(cancelBooking).to.have.callCount(1);
        });
    });
  });

  describe('getExchangeInformation', () => {
    it('should check functions to be called', () => {
      const d = moment();
      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.resolve(getURByPNRSampleBooked)
      );

      const exchange = sinon.spy(({ bookingDate }) => {
        expect(bookingDate).to.be.equal(d.format('YYYY-MM-DD'));
      });

      const airService = () => ({
        exchangeQuote: exchange,
        getUniversalRecordByPNR,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      const service = createAirService({ auth });

      return service.getExchangeInformation({
        pnr: 'PNR001',
      }).then(() => {
        expect(getUniversalRecordByPNR).to.have.callCount(1);
        expect(exchange).to.have.callCount(1);
      });
    });
  });

  describe('exchangeBooking', () => {
    it('should check functions to be called', () => {
      const getUniversalRecordByPNR = sinon.spy(
        () => Promise.resolve(getURbyPNRSampleTicketed)
      );

      const exchange = sinon.spy(({ exchangeToken, uapi_reservation_locator }) => {
        expect(exchangeToken).to.be.equal('token');
        expect(uapi_reservation_locator).to.be.equal('ABCDEF');
      });

      const airService = () => ({
        exchangeBooking: exchange,
        getUniversalRecordByPNR,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      const service = createAirService({ auth });

      return service.exchangeBooking({
        exchangeToken: 'token',
        pnr: 'PNR001',
      }).then(() => {
        expect(getUniversalRecordByPNR).to.have.callCount(1);
        expect(exchange).to.have.callCount(1);
      });
    });
  });

  describe('fareRules', () => {
    it('should check function to be called', () => {
      const fetch = sinon.spy(({ segments, passengers, fetchFareRules }) => {
        expect(segments).to.be.an('array');
        expect(segments).to.have.length(0);
        expect(passengers).to.be.an('object'); // add one fake passenger
        expect(passengers).to.have.all.keys('ADT');
        expect(passengers.ADT).to.equal(1);
        assert(fetchFareRules, 'fetchFareRules is necessary for underlying call');

        return Promise.resolve([
          {
            RuleNumber: '123',
            Source: 'ATPC',
            TariffNumber: 'Test',
            Rules: [],
          },
        ]);
      });

      const airService = () => ({
        lookupFareRules: fetch,
      });

      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': airService,
      });

      const service = createAirService({ auth });

      return service.fareRules({
        segments: [],
        passengers: {
          ADT: 1,
        },
      }).then(() => {
        expect(fetch).to.have.callCount(1);
      });
    });
  });

  describe('prcing', () => {
    it('should check if correct function from service is called', () => {
      const airPrice = sinon.spy(() => {});
      const service = () => ({ airPrice });
      const createAirService = proxyquire('../../src/Services/Air/Air', {
        './AirService': service,
      });
      createAirService({ auth }).airPrice({});
      expect(airPrice.calledOnce).to.be.equal(true);
    });
  });
});
