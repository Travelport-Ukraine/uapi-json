const { expect } = require('chai');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const airParser = require('../../src/Services/Air/AirParser');
const {
  AirFlightInfoRuntimeError,
  AirRuntimeError,
  AirParsingError,
} = require('../../src/Services/Air/AirErrors');
const {
  RequestRuntimeError
} = require('../../src/Request/RequestErrors');
const Parser = require('../../src/Request/uapi-parser');
const errorsConfig = require('../../src/Request/errors-config');

const xmlFolder = path.join(__dirname, '..', 'FakeResponses', 'Air');
const timestampRegexp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[-+]{1}\d{2}:\d{2}/i;
const ticketRegExp = /^\d{13}$/;
const pnrRegExp = /^[A-Z0-9]{6}$/i;
const amountRegExp = /[A-Z]{3}(?:\d+\.)?\d+/i;

const checkLowSearchFareXml = (filename) => {
  const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
  const parseFunction = airParser.AIR_LOW_FARE_SEARCH_REQUEST;
  const xml = fs.readFileSync(filename).toString();
  return uParser.parse(xml).then((json) => {
    const result = parseFunction.call(uParser, json);
    expect(result).to.be.an('array').and.to.have.length.above(0);
    result.forEach(
      (proposal) => {
        expect(proposal).to.be.an('object');
        expect(proposal).to.have.all.keys([
          'totalPrice', 'basePrice', 'taxes', 'directions', 'bookingComponents', 'platingCarrier',
          'passengerFares', 'passengerCounts',
        ]);
        expect(proposal.totalPrice).to.be.a('string').and.to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
        expect(proposal.basePrice).to.be.a('string').and.to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
        expect(proposal.taxes).to.be.a('string').and.to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
        // Directions
        expect(proposal.directions).to.be.an('array').and.to.have.length.above(0);
        proposal.directions.forEach(
          (direction) => {
            expect(direction).to.be.an('array').and.to.have.length.above(0);
            direction.forEach(
              (leg) => {
                expect(leg).to.be.an('object');
                expect(leg).to.have.all.keys([
                  'from', 'to', 'platingCarrier', 'segments',
                ]);
                expect(leg.from).to.match(/^[A-Z]{3}$/);
                expect(leg.to).to.match(/^[A-Z]{3}$/);
                expect(leg.platingCarrier).to.match(/^[A-Z0-9]{2}$/);
                expect(leg.segments).to.be.an('array').and.to.have.length.above(0);
                leg.segments.forEach(
                  (segment) => {
                    expect(segment).to.be.an('object');
                    expect(segment).to.have.all.keys([
                      'from', 'to', 'departure', 'arrival', 'airline', 'flightNumber', 'serviceClass',
                      'plane', 'duration', 'techStops', 'bookingClass', 'baggage',
                      'fareBasisCode', 'group', 'uapi_segment_ref',
                    ]);
                    expect(segment.from).to.match(/^[A-Z]{3}$/);
                    expect(segment.to).to.match(/^[A-Z]{3}$/);
                    expect(segment.group).to.be.a('number');
                    expect(new Date(segment.departure)).to.be.an.instanceof(Date);
                    expect(new Date(segment.arrival)).to.be.an.instanceof(Date);
                    expect(segment.airline).to.match(/^[A-Z0-9]{2}$/);
                    expect(segment.flightNumber).to.match(/^\d+$/);
                    expect(segment.serviceClass).to.be.oneOf([
                      'Economy', 'Business', 'First', 'PremiumEconomy',
                    ]);
                    expect(segment.bookingClass).to.match(/^[A-Z]{1}$/);
                    if (segment.seatsAvailable) {
                      expect(segment.seatsAvailable).to.be.a('number');
                    }
                    // Planes
                    expect(segment.plane).to.be.an('array').and.to.have.length.above(0);
                    segment.plane.forEach(plane => expect(plane).to.be.a('string'));
                    // Duration
                    expect(segment.duration).to.be.an('array').and.to.have.length.above(0);
                    segment.duration.forEach(duration => expect(duration).to.match(/^\d+$/));
                    // Tech stops
                    expect(segment.techStops).to.be.an('array');
                    segment.techStops.forEach(stop => expect(stop).to.match(/^[A-Z]{3}$/));
                    // Baggage
                    expect(segment.baggage).to.be.an('array');
                    segment.baggage.forEach(
                      (baggage) => {
                        expect(baggage).to.be.an('object');
                        expect(baggage).to.have.all.keys(['units', 'amount']);
                        expect(baggage.units).to.be.a('string');
                        expect(baggage.amount).to.be.a('number');
                      }
                    );
                    // Segment reference
                    expect(segment.uapi_segment_ref).to.be.a('string');
                  }
                );
              }
            );
          }
        );
        // Booking components
        expect(proposal.bookingComponents).to.be.an('array').and.to.have.length.above(0);
        proposal.bookingComponents.forEach(
          (component) => {
            expect(component).to.be.an('object');
            expect(component).to.have.all.keys([
              'totalPrice', 'basePrice', 'taxes', 'uapi_fare_reference',
            ]);
            expect(component.totalPrice).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
            expect(component.basePrice).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
            expect(component.taxes).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
            expect(component.uapi_fare_reference).to.be.a('string');
          }
        );
        // Passenger fares
        expect(proposal.passengerFares).to.be.an('object');
        const ptcList = Object.keys(proposal.passengerFares);
        expect(ptcList).to.have.length.above(0);
        ptcList.forEach(
          (ptc) => {
            expect(ptc).to.be.a('string');
            const fare = proposal.passengerFares[ptc];
            expect(fare).to.be.an('object');
            expect(fare).to.have.include.all.keys([
              'totalPrice', 'basePrice', 'taxes',
            ]);
            expect(fare.totalPrice).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
            expect(fare.basePrice).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
            expect(fare.taxes).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
          }
        );
      }
    );
  });
};

describe('#AirParser', () => {
  describe('AIR_CANCEL_TICKET', () => {
    it('should return error when no VoidResultInfo available', () => {
      const check = () => airParser.AIR_CANCEL_TICKET({});
      expect(check).to.throw(AirRuntimeError.TicketCancelResultUnknown);
    });
    it('should return error when no VoidResultInfo Result type is not Success', () => {
      const check = () => airParser.AIR_CANCEL_TICKET({
        'air:VoidResultInfo': {
          ResultType: 'Fail',
        },
      });
      expect(check).to.throw(AirRuntimeError.TicketCancelResultUnknown);
    });
    it('should return true if everything is ok', () => {
      const check = () => airParser.AIR_CANCEL_TICKET({
        'air:VoidResultInfo': {
          ResultType: 'Success',
        },
      });
      expect(check).not.to.throw(Error);
    });
  });
  describe('AIR_CANCEL_PNR', () => {
    it('should return error when no messages available', () => {
      const check = () => airParser.AIR_CANCEL_PNR.call({
        uapi_version: 'v47_0',
      }, {});
      expect(check).to.throw(AirParsingError.CancelResponseNotFound);
    });
    it('should return error when message do not contain Success message', () => {
      const check = () => airParser.AIR_CANCEL_PNR.call({
        uapi_version: 'v47_0',
      }, {
        'common_v47_0:ResponseMessage': [{
          _: 'Some message',
        }, {
          _: 'Another message',
        }],
      });
      expect(check).to.throw(AirParsingError.CancelResponseNotFound);
    });
    it('should return true if everything is ok', () => {
      const check = () => airParser.AIR_CANCEL_PNR.call({
        uapi_version: 'v47_0',
      }, {
        'common_v47_0:ResponseMessage': [{
          _: 'Itinerary Cancelled',
        }],
      });
      expect(check).not.to.throw(Error);
    });
  });

  describe('getTickets', () => {
    it('should return empty array if UR have no tickets', async () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKETS;
      const errorHandler = airParser.AIR_GET_TICKETS_ERROR_HANDLER;
      const xml = fs.readFileSync(`${xmlFolder}/AirGetTickets-error-no-tickets.xml`).toString();

      const rsp = await uParser.parse(xml);
      const errRsp = errorHandler.call(uParser, uParser.mergeLeafRecursive(rsp['SOAP:Fault'][0]));
      const res = parseFunction.call(uParser, errRsp);
      expect(res).to.be.a('array').that.is.empty;
    });
    it('should return array if UR have tickets', async () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKETS;
      const xml = fs.readFileSync(`${xmlFolder}/AirGetTickets-several-tickets.xml`).toString();

      const rsp = await uParser.parse(xml);
      const res = parseFunction.call(uParser, rsp);
      expect(res).to.be.a('array').and.to.have.lengthOf(2);
    });
    it('should return array if UR has one ticket', async () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKETS;
      const xml = fs.readFileSync(`${xmlFolder}/AirGetTickets-one-ticket.xml`).toString();

      const rsp = await uParser.parse(xml);
      const res = parseFunction.call(uParser, rsp);
      expect(res).to.be.a('array').and.to.have.lengthOf(1);
    });
    it('should correctly handle error of agreement', async () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const errorHandler = airParser.AIR_GET_TICKETS_ERROR_HANDLER;
      const xml = fs.readFileSync(`${xmlFolder}/NoAgreementError.xml`).toString();

      const rsp = await uParser.parse(xml);
      try {
        errorHandler.call(uParser, uParser.mergeLeafRecursive(rsp['SOAP:Fault'][0]));
        throw new Error('Skipped NoAgreement error!');
      } catch (err) {
        expect(err).to.be.an.instanceof(AirRuntimeError.NoAgreement);
        expect(err.data.pcc).to.be.equal('7J8J');
      }
    });
    it('should correctly handle other errors', async () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const errorHandler = airParser.AIR_GET_TICKETS_ERROR_HANDLER;
      const xml = fs.readFileSync(`${xmlFolder}/AirGetTickets-error-general.xml`).toString();

      const rsp = await uParser.parse(xml);
      try {
        errorHandler.call(uParser, uParser.mergeLeafRecursive(rsp['SOAP:Fault'][0]));
        throw new Error('Skipped NoAgreement error!');
      } catch (err) {
        expect(err).to.be.an.instanceof(RequestRuntimeError.UnhandledError);
      }
    });
  });

  describe('getTicket', () => {
    function testTicket(result) {
      expect(result).to.be.an('object');
      expect(result).to.include.all.keys([
        'uapi_ur_locator', 'uapi_reservation_locator', 'pnr', 'ticketNumber',
        'platingCarrier', 'ticketingPcc', 'issuedAt',
        'fareCalculation', 'farePricingMethod', 'farePricingType',
        'priceInfoDetailsAvailable', 'priceInfoAvailable',
        'taxes', 'taxesInfo',
        'noAdc', 'isConjunctionTicket', 'passengers', 'tickets',
      ]);
      if (result.exchangedTickets) {
        expect(result.exchangedTickets).to.be.an('array')
          .and.to.have.length.above(0);
        result.exchangedTickets.forEach(
          (t) => {
            expect(t).to.match(ticketRegExp);
          }
        );
      }
      expect(result.uapi_ur_locator).to.match(pnrRegExp);
      expect(result.uapi_reservation_locator).to.match(pnrRegExp);
      expect(result.pnr).to.match(pnrRegExp);
      expect(result.ticketNumber).to.match(ticketRegExp);
      expect(result.platingCarrier).to.match(/^[A-Z0-9]{2}$/i);
      expect(result.ticketingPcc).to.match(/^[A-Z0-9]{3,4}$/i);
      expect(result.isConjunctionTicket).to.be.a('boolean');
      expect(result.issuedAt).to.match(timestampRegexp);
      expect(result.fareCalculation).to.be.a('string').and.to.have.length.above(0);
      // Price info
      expect(result.priceInfoAvailable).to.be.a('boolean');
      expect(result.priceInfoDetailsAvailable).to.be.a('boolean');
      expect(result).to.be.an('object');
      if (result.priceInfoAvailable) {
        expect(result.totalPrice).to.match(amountRegExp);
        expect(result.basePrice).to.match(amountRegExp);
        if (result.equivalentBasePrice) {
          expect(result.equivalentBasePrice).to.match(amountRegExp);
        }
      }
      expect(result.taxes).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
      expect(result.taxesInfo).to.be.an('array');
      result.taxesInfo.forEach(
        (tax) => {
          expect(tax).to.be.an('object');
          expect(tax.value).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
          expect(tax.type).to.match(/^[A-Z]{2}$/);
        }
      );
      // Passengers
      expect(result.passengers).to.be.an('array');
      expect(result.passengers).to.have.length.above(0);
      result.passengers.forEach((passenger) => {
        expect(passenger).to.be.an('object');
        expect(passenger).to.have.all.keys(['firstName', 'lastName']);
      });
      // Tickets
      expect(result.tickets).to.be.an('array');
      expect(result.tickets).to.have.length.above(0);
      result.tickets.forEach((ticket) => {
        expect(ticket).to.be.an('object');
        expect(ticket).to.include.all.keys(['ticketNumber', 'coupons']);
        if (ticket.exchangedTickets) {
          expect(ticket.exchangedTickets)
            .to.be.an('array')
            .and.to.have.length.above(0);
        }
        expect(ticket.ticketNumber).to.match(/\d{13}/i);
        expect(ticket.coupons).to.be.an('array');
        expect(ticket.coupons).to.have.length.above(0);
        ticket.coupons.forEach((coupon) => {
          expect(coupon).to.be.an('object');
          expect(coupon).to.include.all.keys([
            'couponNumber', 'from', 'to', 'departure', 'airline', 'flightNumber',
            'fareBasisCode', 'status', 'notValidBefore', 'notValidAfter',
            'bookingClass', 'stopover',
          ]);
          expect(coupon.couponNumber).to.match(/\d+/i);
          expect(coupon.from).to.match(/[A-Z]{3}/i);
          expect(coupon.from).to.match(/[A-Z]{3}/i);
          expect(coupon.departure).to.match(timestampRegexp);
          expect(coupon.bookingClass).to.match(/[A-Z0-9]{1}/i);
          expect(coupon.airline).to.match(/[A-Z0-9]{2}/i);
          expect(coupon.flightNumber).to.match(/\d+/i);
          expect(coupon.fareBasisCode).to.match(/[A-Z0-9]+/i);
          expect(coupon.status).to.be.oneOf([
            'A', 'C', 'F', 'L', 'O', 'P', 'R', 'E', 'V', 'Z', 'U', 'S', 'I', 'D', 'X',
          ]);
          expect(coupon.notValidBefore).to.match(/\d{4}-\d{2}-\d{2}/i);
          expect(coupon.notValidAfter).to.match(/\d{4}-\d{2}-\d{2}/i);
        });
      });
    }

    it('should parse NO ADC ticket', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_NOADC.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
          expect(result.priceInfoDetailsAvailable).to.equal(false);
          expect(result.noAdc).to.equal(true);
          expect(result.totalPrice).to.equal('UAH0');
          expect(result.commission).to.be.deep.equal({ percent: 0.1 });
        });
    });

    it('should parse ticket without booking info', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_NO_BOOKING_INFO.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
        });
    });

    it('should return correct error for duplicate ticket number', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_DUPLICATE_TICKET.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then(() => Promise.reject(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.DuplicateTicketFound);
        });
    });

    it('should parse exchangedTicket when available', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_EXCHANGED_TICKET.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
          expect(result.priceInfoDetailsAvailable).to.equal(true);
          expect(result.exchangedTickets).to.have.length.above(0);
        });
    });

    it('should correctly parse ticket with commission if fareInfo', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_COMMISSION_FARE.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
          expect(result.commission).to.be.deep.equal({ amount: 0 });
          expect(result.tourCode).to.be.equal('IT151920');
        });
    });

    it('should correctly parse IT ticket', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_IT.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
          expect(result.commission).to.be.deep.equal({ percent: 0.1 });
        });
    });

    it('should correctly parse IT ticket without FQ', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_IT_noFQ.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
        });
    });

    it('should parse exchanged conjunction ticket', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_EXCHANGE_CONJ.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
          const couponsStopover = [false, true, false, true];
          const coupons = result.tickets.reduce(
            (acc, ticket) => acc.concat(ticket.coupons),
            []
          );
          console.log(coupons.map(c => c.stopover));
          coupons.forEach((coupon, index) => {
            expect(coupon.stopover).to.be.equal(couponsStopover[index]);
          });
          expect(result.priceInfoDetailsAvailable).to.equal(true);
          expect(result.exchangedTickets).to.have.length.above(0);
        });
    });

    it('should parse exchanged conjunction ticket stopovers properly', () => {
      /*
        X CTY CX FLT CL DATE  TIME ST FB  / TD        NVB   NVA   BG
        . FCO AF1405  L 15JAN 2000 OK X9PLIT          15JAN 15JAN 0PC  1
        X CDG AF 990  X 15JAN 2335 OK X9PLIT          15JAN 15JAN 0PC  2
        O JNB        ARNK
        O CPT KL 598  M 01FEB 0030 OK MFFIT           22JAN 15APR 1PC  3
        X AMS AZ 107  H 01FEB 1200 OK MFFIT           22JAN 15APR 1PC  4
        . FCO
       */
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKETS;
      const xml = fs.readFileSync(`${xmlFolder}/Stopover/StopoverWithConjunctionAndArnk.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((tickets) => {
          tickets.forEach((result) => {
            testTicket(result);
            const couponsStopover = [false, true, false, true];
            const coupons = result.tickets.reduce(
              (acc, ticket) => acc.concat(ticket.coupons),
              []
            );

            console.log(coupons);
            coupons.forEach((coupon, index) => {
              expect(coupon.stopover).to.be.equal(couponsStopover[index]);
            });
          });
        });
    });

    it('should return default error if failure and code is not detected', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_UNKNOWN_FAILURE.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then(() => Promise.reject(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.TicketRetrieveError);
        });
    });

    it('should return error when not available to return ticket', (done) => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_FAILED.xml`).toString();
      uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.TicketRetrieveError);
          done();
        });
    });
    it('should parse imported ticket', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_IMPORTED.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
          expect(result.priceInfoDetailsAvailable).to.equal(true);
          expect(result.taxesInfo).to.have.length.above(0);
        });
    });

    it('should parse imported ticket with single cabin class for all coupons', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_ONE_CABIN_CLASS.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
          expect(result.priceInfoDetailsAvailable).to.equal(true);
          expect(result.taxesInfo).to.have.length.above(0);
        });
    });

    it('should parse ticket with XF and ZP taxes', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_XF_ZP.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testTicket(result);
          expect(result.priceInfoDetailsAvailable).to.equal(true);
          expect(result.taxesInfo).to.have.length.above(0);
          const detialedTaxes = result.taxesInfo.filter(
            tax => ['XF', 'ZP'].indexOf(tax.type) !== -1
          );
          expect(detialedTaxes).to.have.lengthOf(2);
          detialedTaxes.forEach(
            (tax) => {
              expect(tax.details).to.be.an('array').and.to.have.length.above(0);
              tax.details.forEach(
                (detailInfo) => {
                  expect(detailInfo).to.have.all.keys(['airport', 'value']);
                  expect(detailInfo.airport).to.match(/^[A-Z]{3}$/);
                  expect(detailInfo.value).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
                }
              );
            }
          );
        });
    });

    it('should parse incomplete data', () => {
      const uParser = new Parser('air:AirRetrieveDocumentRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_NOT_IMPORTED.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result).to.include.all.keys([
            'uapi_ur_locator',
            'uapi_reservation_locator',
            'pnr',
            'platingCarrier',
            'ticketingPcc',
            'issuedAt',
            'fareCalculation',
            'roe',
            'farePricingMethod',
            'farePricingType',
            'priceInfoAvailable',
            'priceInfoDetailsAvailable',
            'passengers',
            'totalPrice',
            'basePrice',
            'tourCode',
            'taxes',
            'taxesInfo',
            'equivalentBasePrice',
            'noAdc',
            'tickets',
            'isConjunctionTicket',
            'ticketNumber',
          ]);
          expect(result.uapi_ur_locator).to.match(/^[A-Z0-9]{6}$/i);
          expect(result.uapi_reservation_locator).to.match(/^[A-Z0-9]{6}$/i);
          expect(result.pnr).to.match(pnrRegExp);
          expect(result.ticketNumber).to.match(ticketRegExp);
          expect(result.isConjunctionTicket).to.be.a('boolean');
          expect(result.platingCarrier).to.match(/^[A-Z0-9]{2}$/i);
          expect(result.ticketingPcc).to.match(/^[A-Z0-9]{3,4}$/i);
          expect(result.issuedAt).to.match(timestampRegexp);
          expect(result.fareCalculation).to.be.a('string').and.to.have.length.above(0);
          // Price info
          expect(result.priceInfoDetailsAvailable).to.equal(false);
          expect(result.totalPrice).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(result.basePrice).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(result.taxes).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(result.taxesInfo).to.be.an('array').and.to.have.lengthOf(0);
          // Passengers
          expect(result.passengers).to.be.an('array');
          expect(result.passengers).to.have.length.above(0);
          result.passengers.forEach((passenger) => {
            expect(passenger).to.be.an('object');
            expect(passenger).to.have.all.keys(['firstName', 'lastName']);
          });
          // Tickets
          expect(result.tickets).to.be.an('array');
          expect(result.tickets).to.have.length.above(0);
          result.tickets.forEach((ticket) => {
            expect(ticket).to.be.an('object');
            expect(ticket).to.have.all.keys(['ticketNumber', 'coupons']);
            expect(ticket.ticketNumber).to.match(/\d{13}/i);
            expect(ticket.coupons).to.be.an('array');
            expect(ticket.coupons).to.have.length.above(0);
            ticket.coupons.forEach((coupon) => {
              expect(coupon).to.be.an('object');
              expect(coupon).to.have.all.keys([
                'couponNumber', 'from', 'to', 'departure', 'airline', 'flightNumber',
                'fareBasisCode', 'status', 'notValidBefore', 'notValidAfter', 'bookingClass', 'stopover',
                'key', 'ticketNumber',
              ]);
              expect(coupon.couponNumber).to.match(/\d+/i);
              expect(coupon.from).to.match(/[A-Z]{3}/i);
              expect(coupon.from).to.match(/[A-Z]{3}/i);
              expect(coupon.departure).to.match(timestampRegexp);
              expect(coupon.airline).to.match(/[A-Z0-9]{2}/i);
              expect(coupon.flightNumber).to.match(/\d+/i);
              expect(coupon.fareBasisCode).to.match(/[A-Z0-9]+/i);
              expect(coupon.status).to.be.oneOf([
                'A', 'C', 'F', 'L', 'O', 'P', 'R', 'E', 'V', 'Z', 'U', 'S', 'I', 'D', 'X',
              ]);
              expect(coupon.notValidBefore).to.match(/\d{4}-\d{2}-\d{2}/i);
              expect(coupon.notValidAfter).to.match(/\d{4}-\d{2}-\d{2}/i);
            });
          });
        });
    });
  });
  describe('AIR_LOW_FARE_SEARCH()', () => {
    it('should test parsing of low fare search request', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        assert(result.length === 27, 'Length is not 27');
        assert(result[0].basePrice, 'No base price.');
        assert(result[0].taxes, 'No taxes.');
        assert(result[0].totalPrice, 'No total price.');
        assert(result[0].directions, 'No Directions.');
        assert(result[0].bookingComponents, 'No Booking components.');
        assert(result[0].directions.length, 'Directions length not 2.');
        const { directions } = result[0];
        const first = directions[0][0];
        const second = directions[1][0];
        assert(directions[0].length === 1, 'From direction length shoudl be 1');
        assert(first.segments, 'No segments in dir[0][0]');
        assert(second.segments, 'No segments in dir[1][0]');

        assert(first.from, 'No from  in dir[0][0]');
        assert(first.to, 'No to  in dir[0][0]');
        assert(first.platingCarrier, 'No PC in dir[0][0]');
        const segment = first.segments[0];
        assert(segment.arrival, 'Segement should have arrival');
        assert(segment.departure, 'Segement should have departure');
        assert(segment.bookingClass, 'Segement should have bookingClass');
        assert(segment.from, 'Segement should have from');
        assert(segment.to, 'Segement should have to');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });


    it('Should throw ResponseDataMissing if any of mandatory attribute is missing from LFS ', () => {
      const dummyObj1 = {
        AirSegment: null, FareInfo: null, FlightDetails: null, Route: null
      };
      const dummyObj2 = {
        'air:AirPricePointList': null, FareInfo: null, FlightDetails: null
      };

      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', { faresOnly: true });
      const parseFunction = airParser.AIR_LOW_FARE_SEARCH_REQUEST;

      try {
        parseFunction.call(uParser, dummyObj1);
        assert().fail('Failed to throw an exception');
      } catch (err) {
        expect(err).to.be.an.instanceof(AirParsingError.ResponseDataMissing);
      }

      try {
        parseFunction.call(uParser, dummyObj2);
        assert().fail('Failed to throw an exception');
      } catch (err) {
        expect(err).to.be.an.instanceof(AirParsingError.ResponseDataMissing);
      }
    });

    it('Should properly parse xml files', (done) => {
      Promise.all(
        [
          `${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`,
          `${xmlFolder}/LowFaresSearch.1ADTIEVPAR.xml`,
        ].map(checkLowSearchFareXml)
      )
        .then(() => done())
        .catch(done);
    });

    it('should throw AirRuntimeError.NoResultsFound error', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_ERRORS;
      const xml = fs.readFileSync(`${xmlFolder}/../Other/UnableToFareQuoteError.xml`).toString();
      return uParser.parse(xml)
        .then(
          (json) => {
            const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]); // parse error data
            return parseFunction.call(uParser, errData);
          }
        )
        .catch(
          err => expect(err).to.be.an.instanceof(AirRuntimeError.NoResultsFound)
        );
    });

    it('should throw AirRuntimeError.NoResultsFound error2', () => {
      const uParser = new Parser('SOAP:Fault', 'v47_0', {});
      const parseFunction = airParser.AIR_ERRORS.bind(uParser);
      const json = fs.readFileSync(`${xmlFolder}/../Air/LowFaresSearch.NoSolutions.Parsed.error.json`).toString();
      return Promise.resolve()
        .then(() => parseFunction(JSON.parse(json)))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.NoResultsFound);
        });
    });

    it('should throw AirRuntimeError.NoResultsFound error3', () => {
      const uParser = new Parser('SOAP:Fault', 'v47_0', {});
      const parseFunction = airParser.AIR_ERRORS.bind(uParser);
      const json = fs.readFileSync(`${xmlFolder}/../Air/LowFaresSearch.date-time-in-past.Parsed.error.json`).toString();
      return Promise.resolve()
        .then(() => parseFunction(JSON.parse(json)))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.InvalidRequestData);
        });
    });
  });

  describe('AIR_PRICE_REQ()', () => {
    const testPricing = (jsonResult) => {
      assert(jsonResult.basePrice, 'No base price.');
      assert(jsonResult.taxes, 'No taxes.');
      assert(jsonResult.totalPrice, 'No total price.');
      assert(jsonResult.directions, 'No Directions.');
      assert(jsonResult.bookingComponents, 'No Booking components.');
      assert(jsonResult.directions.length, 'Directions length not 2.');
    };

    const testSegments = (jsonResult, segmentCounts) => {
      const { directions } = jsonResult;
      assert(directions.length === segmentCounts.length, `From direction length should be ${segmentCounts.length}`);

      segmentCounts.forEach((numberOfSegmentsInLeg, legIndex) => {
        const [leg] = directions[legIndex];
        assert(leg, `No segments in dir[${legIndex}]`);
        assert(leg.segments.length === numberOfSegmentsInLeg, `Segments in direction ${legIndex} length should be ${numberOfSegmentsInLeg}`);

        leg.segments.forEach((seg) => {
          assert(seg.arrival, 'Segement should have arrival');
          assert(seg.departure, 'Segement should have departure');
          assert(seg.bookingClass, 'Segement should have bookingClass');
          assert(seg.from, 'Segement should have from');
          assert(seg.to, 'Segement should have to');
        });
      });
    };

    const passengers = [{
      lastName: 'ENEKEN',
      firstName: 'SKYWALKER',
      passCountry: 'UA',
      passNumber: 'ES221731',
      birthDate: '19680725',
      Age: 30,
      gender: 'M',
      ageCategory: 'ADT',
    }];

    const uParser = new Parser('air:AirPriceRsp', 'v47_0', { passengers });
    const parseFunction = airParser.AIR_PRICE_REQUEST;

    it('should test parser for correct work', () => {
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.IEVPAR.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testPricing(jsonResult);
        testSegments(jsonResult, [2]);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test another request with 2 adults and 1 child', () => {
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.IEVPAR.2ADT1CNN.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testPricing(jsonResult);
        testSegments(jsonResult, [2]);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test another request with 2 air priceing solutions', () => {
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.2AirPrice.xml`).toString();

      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testPricing(jsonResult);
        // TODO: Shouldn't this example be seperated to 2 segment groups? (round-trip)
        testSegments(jsonResult, [4]);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });

  describe('AIR_PRICE_REQ_XML()', () => {
    const test = (jsonResult) => {
      const airprice = jsonResult['air:AirPricingSolution'];
      const airpricexml = jsonResult['air:AirPricingSolution_XML'];
      assert(airprice, 'no air:AirPricingSolution');
      assert(airpricexml, 'no xml object');

      assert(airprice.TotalPrice, 'No total price');
      assert(airprice.Key, 'No key');
      assert(airprice.Taxes, 'No taxes');

      assert(airpricexml['air:AirPricingInfo_XML'], 'no air:AirPricingInfo_XML');
      assert(airpricexml['air:AirSegment_XML'], 'no air:AirSegment_XML');
      assert(airpricexml['air:FareNote_XML'], 'no air:FareNote_XML');
    };

    it('should test parser for correct work', () => {
      const passengers = [{
        lastName: 'ENEKEN',
        firstName: 'SKYWALKER',
        passCountry: 'UA',
        passNumber: 'ES221731',
        birthDate: '19680725',
        Age: 30,
        gender: 'M',
        ageCategory: 'ADT',
      }];

      const uParser = new Parser(null, 'v47_0', { passengers });
      const parseFunction = airParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML;
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.IEVPAR.xml`).toString();
      const jsonSaved = JSON.parse(
        fs.readFileSync(`${xmlFolder}/AirPricingSolution.IEVPAR.json`).toString()
      );
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        test(jsonResult);
        assert(JSON.stringify(jsonSaved) === JSON.stringify(jsonResult), 'Result is not equal to parsed');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test another request with 2 adults and 1 child', () => {
      const passengers = [{
        lastName: 'ENEKEN',
        firstName: 'SKYWALKER',
        passCountry: 'UA',
        passNumber: 'ES221731',
        birthDate: '19680725',
        Age: 30,
        gender: 'M',
        ageCategory: 'ADT',
      }];

      const uParser = new Parser(null, 'v47_0', { passengers });
      const parseFunction = airParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML;
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.IEVPAR.2ADT1CNN.xml`).toString();
      const jsonSaved = JSON.parse(
        fs.readFileSync(`${xmlFolder}/AirPricingSolution.IEVPAR.2ADT1CNN.json`).toString()
      );
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        test(jsonResult);
        assert(JSON.stringify(jsonSaved) === JSON.stringify(jsonResult), 'Result is not equal to parsed');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test another request with 2 air priceing solutions', () => {
      const passengers = [{
        lastName: 'ENEKEN',
        firstName: 'SKYWALKER',
        passCountry: 'UA',
        passNumber: 'ES221731',
        birthDate: '19680725',
        Age: 30,
        gender: 'M',
        ageCategory: 'ADT',
      }];

      const uParser = new Parser(null, 'v47_0', { passengers });
      const parseFunction = airParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML;
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.2AirPrice.xml`).toString();
      // const jsonSaved = fs.readFileSync(`${xmlFolder}/AirPricingSolution.2AirPrice.xml.json');
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        test(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });

  it('should test a request with hosttoken', () => {
    const passengers = [{
      Age: 30,
      ageCategory: 'ADT',
    }];

    const uParser = new Parser(null, 'v47_0', { passengers });
    const parseFunction = airParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML;
    const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution-with-host-token.ICNHKG.xml`).toString();
    const jsonSaved = JSON.parse(
      fs.readFileSync(`${xmlFolder}/AirPricingSolution-with-host-token.ICNHKG.json`).toString()
    );
    return uParser.parse(xml).then((json) => {
      const jsonResult = parseFunction.call(uParser, json);
      assert.deepEqual(jsonResult, jsonSaved, 'Result is not equivalent to expected');
    }).catch(err => assert(false, 'Error during parsing' + err.stack));
  });

  describe('AIR_PRICE_FARE_RULES()', () => {
    const test = (jsonResult) => {
      assert(Array.isArray(jsonResult), 'should return an array of rule sets');
      jsonResult.forEach((item) => {
        assert(item.RuleNumber, 'No RuleNumber');
        assert(item.Source, 'No Source');
        assert(item.TariffNumber, 'No TariffNumber');
        assert(Array.isArray(item.Rules), 'Rules should be an array');
        item.Rules.forEach((ruleSting) => {
          assert(typeof ruleSting === 'string', 'rule items should be strings');
        });
      });
    };

    it('should test parser for correct work', () => {
      const uParser = new Parser('air:AirPriceRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_PRICE_FARE_RULES_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirPriceReq.fareRules.xml`).toString();
      const jsonSaved = JSON.parse(fs.readFileSync(`${xmlFolder}/AirPriceReq.fareRules.json`));
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        test(jsonResult);
        // throw away nulls from JSON conversion
        jsonSaved[0].Rules.filter((item, key) => {
          if (!item) delete jsonSaved[0].Rules[key];

          return null;
        });
        assert.deepEqual(jsonResult, jsonSaved, 'Result is not equivalent to expected');
      }).catch(err => assert(false, 'Error during parsing ' + err.stack));
    });
  });

  function testBooking(jsonResult) {
    expect(jsonResult).to.be.an('array');
    jsonResult.forEach((result) => {
      expect(result).to.be.an('object');
      // Checking object keys
      expect(result).to.include.all.keys([
        'version', 'uapi_ur_locator', 'uapi_reservation_locator',
        'airlineLocatorInfo', 'bookingPCC', 'passengers', 'pnr',
        'fareQuotes', 'segments', 'serviceSegments', 'hostCreatedAt',
        'createdAt', 'modifiedAt', 'type', 'tickets', 'emails',
      ]);
      expect(result.version).to.be.at.least(0);
      expect(result.uapi_ur_locator).to.match(/^[A-Z0-9]{6}$/);
      expect(result.uapi_reservation_locator).to.match(/^[A-Z0-9]{6}$/);
      expect(result.airlineLocatorInfo).to.be.an('array');
      expect(result.emails).to.be.an('array');
      result.airlineLocatorInfo.forEach((info) => {
        expect(info).have.all.keys([
          'createDate',
          'supplierCode',
          'locatorCode',
        ]);
        expect(new Date(info.createDate)).to.be.instanceof(Date);
        expect(info.supplierCode).to.match(/^[A-Z0-9]{2}$/);
        expect(info.locatorCode).to.match(/^[A-Z0-9]{6}$/);
      });
      expect(result.bookingPCC).to.match(/^[A-Z0-9]{3,4}$/);
      expect(result.pnr).to.match(/^[A-Z0-9]{6}$/);
      expect(new Date(result.hostCreatedAt)).to.be.an.instanceof(Date);
      expect(new Date(result.createdAt)).to.be.an.instanceof(Date);
      expect(new Date(result.modifiedAt)).to.be.an.instanceof(Date);
      expect(result.type).to.equal('uAPI');
      // Checking passengers format
      expect(result.passengers).to.be.an('array');
      expect(result.passengers).to.have.length.above(0);
      result.passengers.forEach((passenger) => {
        expect(passenger).to.be.an('object');
        expect(passenger).to.include.keys([
          'lastName', 'firstName', 'uapi_passenger_ref',
        ]);
      });
      // Checking reservations format
      expect(result.fareQuotes).to.be.an('array');
      result.fareQuotes.forEach((fareQuote) => {
        expect(fareQuote).to.be.an('object');
        expect(fareQuote).to.include.all.keys([
          'index',
          'pricingInfos',
          'uapi_segment_refs',
          'uapi_passenger_refs',
          'endorsement',
          'effectiveDate',
        ]);
        expect(fareQuote.index).to.be.a('number');
        expect(fareQuote.pricingInfos).to.be.an('array').and.to.have.length.above(0);

        if (fareQuote.tourCode) {
          expect(fareQuote.tourCode).to.match(/^[A-Z0-9]+/);
        }

        if (fareQuote.endorsement) {
          expect(fareQuote.endorsement).to.match(/^[A-Z0-9.\-\s/]+$/);
        }

        if (fareQuote.platingCarrier) {
          expect(fareQuote.platingCarrier).to.match(/^[A-Z0-9]{2}$/);
        }

        expect(fareQuote.uapi_passenger_refs).to.be.an('array');
        expect(fareQuote.uapi_passenger_refs).to.have.length.above(0);
        fareQuote.uapi_passenger_refs.forEach(
          reference => expect(reference).to.be.a('string')
        );

        // Segment references
        expect(fareQuote.uapi_segment_refs).to.be.an('array');
        expect(fareQuote.uapi_segment_refs).to.have.length.above(0);
        fareQuote.uapi_segment_refs.forEach(
          reference => expect(reference).to.be.a('string')
        );

        fareQuote.pricingInfos.forEach(
          (pricingInfo) => {
            expect(pricingInfo).to.include.all.keys([
              'fareCalculation',
              'farePricingMethod',
              'farePricingType',
              'baggage',
              'timeToReprice',
              'passengers',
              'uapi_pricing_info_ref',
              'totalPrice',
              'basePrice',
              'equivalentBasePrice',
              'taxes',
              'passengersCount',
              'taxesInfo',
            ]);

            // Passengers
            pricingInfo.passengers.forEach(
              (p) => {
                expect(p).to.be.an('object');
                expect(p).to.include.all.keys(['uapi_passenger_ref', 'isTicketed']);
                expect(p.uapi_passenger_ref).to.be.a('string');
                expect(p.isTicketed).to.be.a('boolean');
                if (p.isTicketed) {
                  expect(p.ticketNumber).to.be.a('string').and.to.match(ticketRegExp);
                }
              }
            );

            expect(pricingInfo.fareCalculation).to.be.a('string').and.to.have.length.above(0);
            expect(new Date(pricingInfo.timeToReprice)).to.be.an.instanceof(Date);

            expect(pricingInfo.passengersCount).to.be.an('object');
            Object.keys(pricingInfo.passengersCount).forEach(
              ptc => expect(pricingInfo.passengersCount[ptc]).to.be.a('number')
            );
            expect(pricingInfo.taxesInfo).to.be.an('array');
            pricingInfo.taxesInfo.forEach(
              (tax) => {
                expect(tax).to.be.an('object');
                expect(tax.value).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
                expect(tax.type).to.match(/^[A-Z]{2}$/);
              }
            );
            // Checking baggage
            expect(pricingInfo.baggage).to.be.an('array');
            pricingInfo.baggage.forEach(
              (baggage) => {
                expect(baggage).to.be.an('object');
                expect(baggage).to.have.all.keys(['units', 'amount']);
                expect(baggage.units).to.be.a('string');
                expect(baggage.amount).to.be.a('number');
              }
            );
          }
        );
      });
      // Checking segments format
      expect(result.segments).to.be.an('array');
      result.segments.forEach(
        (segment) => {
          expect(segment).to.be.an('object');
          expect(segment).to.have.all.keys([
            'index', 'from', 'to', 'bookingClass', 'departure', 'arrival', 'airline',
            'flightNumber', 'serviceClass', 'status', 'plane', 'duration',
            'techStops', 'group', 'uapi_segment_ref',
          ]);
          expect(segment.index).to.be.a('number');
          expect(segment.from).to.match(/^[A-Z]{3}$/);
          expect(segment.to).to.match(/^[A-Z]{3}$/);
          expect(segment.bookingClass).to.match(/^[A-Z]{1}$/);
          expect(new Date(segment.departure)).to.be.an.instanceof(Date);
          expect(new Date(segment.arrival)).to.be.an.instanceof(Date);
          expect(segment.airline).to.match(/^[A-Z0-9]{2}$/);
          expect(segment.flightNumber).to.match(/^\d+$/);
          expect(segment.serviceClass).to.be.oneOf([
            'Economy', 'Business', 'First', 'PremiumEconomy',
          ]);
          expect(segment.status).to.match(/^[A-Z]{2}$/);
          // Planes
          if (segment.plane) {
            expect(segment.plane).to.be.an('array');
            segment.plane.forEach(plane => expect(plane).to.be.a('string'));
          }
          // Duration
          expect(segment.duration).to.be.an('array');
          segment.duration.forEach(duration => expect(duration).to.match(/^\d+$/));
          // Tech stops
          expect(segment.techStops).to.be.an('array');
          segment.techStops.forEach(stop => expect(stop).to.match(/^[A-Z]{3}$/));
          // Segment reference
          expect(segment.uapi_segment_ref).to.be.a('string');
        }
      );

      if (result.serviceSegments) {
        expect(result.serviceSegments).to.be.an('array');
        const allSegments = [].concat(result.segments).concat(result.serviceSegments);
        const maxIndex = allSegments.reduce((acc, x) => {
          if (x.index > acc) {
            return x.index;
          }
          return acc;
        }, 0);
        expect(maxIndex).to.be.equal(allSegments.length);
        result.serviceSegments.forEach((segment) => {
          expect(segment).to.include.all.keys([
            'index', 'carrier', 'airport', 'date', 'rfiCode',
            'rfiSubcode', 'feeDescription', 'name', 'amount', 'currency',
          ]);
          expect(segment.carrier).to.match(/^[A-Z0-9]{2}$/);
          expect(segment.airport).to.match(/^[A-Z]{3}$/);
          expect(new Date(segment.date)).to.be.instanceof(Date);
          expect(segment.rfiCode).to.match(/^[A-Z]$/);
          expect(segment.rfiSubcode).to.match(/^[0-9A-Z]{3}$/);
          expect(segment.feeDescription).to.be.a('string');
          expect(segment.name).to.match(/^[A-Z]+\/[A-Z]+$/);
          expect(segment.amount).to.be.a('number');
          expect(segment.currency).to.match(/^[A-Z]{3}$/);
        });
      }

      // Checking tickets
      expect(result.tickets).to.be.an('array');
      if (result.tickets.length > 0) {
        result.tickets.forEach(
          (ticket) => {
            expect(ticket).to.be.an('object').and.to.have.all.keys([
              'number', 'uapi_passenger_ref', 'uapi_pricing_info_ref', 'passengers',
            ]);
            expect(ticket.passengers.length).to.be.equal(1);
            expect(ticket.passengers[0]).to.have.all.keys(['firstName', 'lastName']);
            expect(ticket.number).to.match(/\d{13}/);
            expect(ticket.uapi_passenger_ref).to.be.a('string');
          }
        );
      }
    });
  }

  describe('AIR_CREATE_RESERVATION()', () => {
    it('should parse booking with no details on some segments', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getBooking-no-details.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testBooking(result);
          const { segments } = result[0];
          expect(segments[0].plane).to.has.lengthOf(0);
          expect(segments[0].duration).to.has.lengthOf(0);
          expect(segments[1].plane).to.has.lengthOf(0);
          expect(segments[1].duration).to.has.lengthOf(0);
          expect(segments[2].plane).to.has.lengthOf(1);
          expect(segments[2].duration).to.has.lengthOf(1);
          expect(segments[3].plane).to.has.lengthOf(1);
          expect(segments[3].duration).to.has.lengthOf(1);
        });
    });
    it('should parse booking with XF and ZP taxes in FQ', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getBooking_XF_ZP.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testBooking(result);
          const detialedTaxes = result[0].fareQuotes[0].pricingInfos[0].taxesInfo.filter(
            tax => ['XF', 'ZP'].indexOf(tax.type) !== -1
          );
          expect(detialedTaxes).to.have.lengthOf(2);
          detialedTaxes.forEach(
            (tax) => {
              expect(tax.details).to.be.an('array').and.to.have.length.above(0);
              tax.details.forEach(
                (detailInfo) => {
                  expect(detailInfo).to.have.all.keys(['airport', 'value']);
                  expect(detailInfo.airport).to.match(/^[A-Z]{3}$/);
                  expect(detailInfo.value).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
                }
              );
            }
          );
        });
    });

    it('should get flight details from separate requests if not available in importBooking');

    it('should parse split booking child', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0');
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getBooking_split_child.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          expect(result[0].splitBookings).to.be.an('array').and.to.have.lengthOf(1);
        });
    });

    it('should parse split booking parent', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0');
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getBooking_split_parent.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          expect(result[0].splitBookings).to.be.an('array').and.to.have.lengthOf(1);
        });
    });

    it('should parse booking with emails', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getBooking_emails.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testBooking(result);
          const { emails } = result[0];
          expect(emails).to.have.lengthOf(2);
          emails.forEach(
            (email, index) => {
              expect(email.index).to.equal(index + 1);
              expect(email.email).to.be.a('string');
            }
          );
        });
    });

    it('should parse exchanged ticket booking with conjunction', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getBooking_EXCHANGE_CONJ.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          // General booking test is skipped as no info about plane is avialable
          // @todo: add general parsing here
          // testBooking(result);
          const fqPassenger = result[0].fareQuotes[0].pricingInfos[0].passengers[0];
          expect(fqPassenger).to.be.an('object')
            .and.to.have.all.keys(['uapi_passenger_ref', 'isTicketed', 'ticketNumber']);
          expect(fqPassenger.isTicketed).to.equal(true);
          expect(fqPassenger.ticketNumber).to.be.a('string');
        });
    });

    it('should parse booking with issued EMD-s', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getBooking-EMD-issued.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testBooking(result);
          const issuedServiceSegments = result[0].serviceSegments.find(
            item => item.documentNumber !== undefined
          );
          expect(issuedServiceSegments).to.be.an('object');
        });
    });

    it('should correclty parse segments order with service segment', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getBooking-with-service-segments.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          const { segments } = result[0];
          testBooking(result);
          expect(segments[0].index).to.equal(1);
          expect(segments[1].index).to.equal(2);
        });
    });

    it('should test parsing of create reservation 2ADT1CNN', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.2ADT1CNN.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT (2)', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT (3)', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of reservation with no valid fare error', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.SegmentFailure.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be SegmentBookingFailed error.');
      }).catch((err) => {
        assert(err, 'No error returned');
        assert(err instanceof AirRuntimeError.SegmentBookingFailed, 'Should be SegmentBookingFailed error.');
      });
    });

    it('should test parsing of reservation with segment failure', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.NOVALIDFARE.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be NoValidFare error.');
      }).catch((err) => {
        assert(err, 'No error returned');
        assert(err instanceof AirRuntimeError.NoValidFare, 'Should be NoValidFare error.');
      });
    });

    it('should test parsing of errors if waitlisted with restrictWaitlist', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { }, false, errorsConfig());
      const parseFunction = airParser.AIR_ERRORS;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.Waitlisted.xml`).toString();
      return uParser.parseXML(xml).then((obj) => {
        const json = uParser.mergeLeafRecursive(obj, 'SOAP:Fault')['SOAP:Fault'];
        return parseFunction.call(uParser, json);
      }).then(() => {
        assert(false, 'Should throw Waitlisted error.');
      }).catch((err) => {
        assert(err, 'No error returned');
        assert(err instanceof AirRuntimeError.SegmentWaitlisted, 'Should be SegmentWaitlisted error.');
      });
    });

    it('should test parsing of a failed reservation (waitlist open, SOAP:Fault)', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { }, false, errorsConfig());
      const parseFunction = airParser.AIR_ERRORS;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.Waitlist.xml`).toString();
      return uParser.parseXML(xml).then((obj) => {
        const json = uParser.mergeLeafRecursive(obj, 'SOAP:Fault')['SOAP:Fault'];
        return parseFunction.call(uParser, json);
      }).then(() => {
        assert(false, 'Should throw an error.');
      }).catch((err) => {
        assert(err, 'No error returned');
        assert(err instanceof AirRuntimeError.SegmentBookingFailed, 'Should be SegmentBookingFailed error.');
      });
    });

    it('should auto detect version and parse 36 version for a failed reservation', () => {
      const uParser = new Parser('universal:AirCreateReservationRsp', 'v47_0', { }, false, errorsConfig());
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.Waitlist.xml`).toString();
      return uParser.parse(xml).then(() => {
        assert(uParser.uapi_version === 'v47_0', 'auto-detect correct version');
      });
    });
  });

  describe('AIR_TICKET_REQUEST', () => {
    it('should test parsing ticketing response', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
      });
    });

    it('should auto detect version and parse 36 version', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing36.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
      });
    });

    it('should test parsing ticketing response', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
      });
    });

    it('should throw parsing error TicketingResponseMissing', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.NOT-OK.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should not return response.');
      }).catch((e) => {
        assert(e instanceof AirRuntimeError.TicketingResponseMissing);
      });
    });

    it('should throw error TicketingPNRBusy', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing-busyPNR.fabricated_reply.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should not return response.');
      }).catch((e) => {
        assert(e instanceof AirRuntimeError.TicketingPNRBusy);
      });
    });

    it('should throw error TicketingFOPUnavailable (12008: Host Error during ticket issue)', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing-CardPaymentUnavailable.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should not return response.');
      }).catch((e) => {
        assert(e instanceof AirRuntimeError.TicketingFOPUnavailable);
      });
    });

    it('should throw error TicketingCreditCardRejected (12008: Host Error during ticket issue)', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing-CardPayment-RefuseCredit.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should not return response.');
      }).catch((e) => {
        assert(e instanceof AirRuntimeError.TicketingCreditCardRejected);
      });
    });

    it('should throw any AirRuntimeError different from TicketingFOPUnavailable/TicketingCreditCardRejected for other host errors (12008: Host Error during ticket issue)', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing-HostError.fabricated_reply.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should not return response.');
      }).catch((e) => {
        assert(!(e instanceof AirRuntimeError.TicketingFOPUnavailable));
        assert(!(e instanceof AirRuntimeError.TicketingCreditCardRejected));
        assert(e instanceof AirRuntimeError);
      });
    });

    it('should throw any AirRuntimeError for missing Fare Quote (3788: Unable to ticket without pricing information)', () => {
      const uParser = new Parser('air:AirTicketingRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing-FareQuoteMissing.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should not return response.');
      }).catch((e) => {
        assert(e instanceof AirRuntimeError);
      });
    });
  });

  describe('UNIVERSAL_RECORD_RETRIEVE_REQUEST', () => {
    it('should test parsing of universal record retrieve request', () => {
      const uParser = new Parser('universal:UniversalRecordRetrieveRsp', 'v47_0', {});
      const parseFunction = airParser.UNIVERSAL_RECORD_RETRIEVE_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordRetrieve.xml`)
        .toString();
      return uParser.parse(xml)
        .then((json) => {
          const jsonResult = parseFunction.call(uParser, json);
          testBooking(jsonResult, false);
        });
    });
  });

  describe('UNIVERSAL_RECORD_IMPORT_SIMPLE_REQUEST', () => {
    it('should parse booking with malformed air price', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordMalformedAirPrice.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testBooking(result);
          expect(result[0].fareQuotes.length).to.be.eq(1);
        });
    });

    it('should parse booking with warnings and missing fare info and should show messages', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordWithWarnings.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          expect(result[0].fareQuotes.length).to.be.eq(1);
          expect(result[0].messages.length).to.be.eq(2);
          expect(result[0].messages[0]._).to.be.eq('Reservation is currently being updated by another process.');
          expect(result[0].messages[1]._).to.be.eq('Unable to map a stored fare to FareInfo.');
        });
    });

    it('should test parsing of universal record import request', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should test parsing of universal record import request 2', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should test parsing of universal record with passive segments', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport-passive-segments.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should test parsing of universal record with filled endorsement for 1 fq', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport-endorsement.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
        const [booking] = jsonResult;
        expect(booking.fareQuotes[0].endorsement).to.be.equal('FARE RESTRICTIONS APPLY');
      });
    });

    it('should test parsing of endorsement 2', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport-endorsement2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        const [booking] = jsonResult;
        testBooking(jsonResult, false);
        expect(booking.fareQuotes[0].endorsement).to.be.equal('FARE RESTRICTIONS APPLY');
      });
    });


    it('should test parsing of universal record with only passive segments', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport-only-passive-segments.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should parse pnr without segments', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/importBooking.noSegments.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should parse pnr with remark which does not contain service segment', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/importBooking.remark.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should parse pnr having fare quotes without taxes', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/importBooking.fq.noTaxes.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should detect correct number of passengers in reservation', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/importBooking.fq.complex.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        // Skipping booking test as it fails for segment info
        // testBooking(jsonResult, false);
        expect(jsonResult[0].fareQuotes[0].pricingInfos[0].passengersCount.ADT)
          .to.equal(2);
      });
    });

    it('should test parsing of universal record import request with tickets', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.Ticket.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false, true);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of universal record import request with tickets (multiple passengers)', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.MultiplePassengers.Ticket.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false, true);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test for correct fq order in pnr', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.MDBMCW.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false, true);
        const [booking] = jsonResult;
        expect(booking.fareQuotes[0].effectiveDate)
          .to.be.equal('2017-07-11T00:00:00.000+02:00');

        expect(booking.fareQuotes[1].effectiveDate)
          .to.be.equal('2017-07-17T00:00:00.000+02:00');

        expect(booking.fareQuotes[2].effectiveDate)
          .to.be.equal('2017-07-29T00:00:00.000+02:00');

        expect(booking.fareQuotes[3].effectiveDate)
          .to.be.equal('2017-07-30T00:00:00.000+02:00');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of tour code', () => {
      const uParser = new Parser('universal:UniversalRecordImportRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.TourCode.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false, true);
        const [booking] = jsonResult;
        expect(booking.segments[0].duration[0]).to.be.equal(0);
        expect(booking.segments[0].plane[0]).to.be.equal('Unknown');
        expect(booking.fareQuotes[0].endorsement).to.be.equal(
          'NONEND/CHNG FOC/PS ONLY REF AT ISSUING OFFICE ONLY'
        );
        expect(booking.fareQuotes[0].tourCode).to.be.equal('SC001S17');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });

  describe('AIR_CANCEL_UR', () => {
    it('parse cancel by UR', () => {
      const uParser = new Parser(null, 'v47_0', { });
      const parseFunction = airParser.AIR_CANCEL_UR;
      const xml = fs.readFileSync(`${xmlFolder}/AirCancelUR.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });

  describe('FLIGHT_INFORMATION', () => {
    it('should parse flight info', () => {
      const uParser = new Parser('air:FlightInformationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_FLIGHT_INFORMATION;
      const xml = fs.readFileSync(`${xmlFolder}/AirFlightInfo.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should return `Flight not found` error from flight info', () => {
      const uParser = new Parser('air:FlightInformationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_FLIGHT_INFORMATION;
      const xml = fs.readFileSync(`${xmlFolder}/AirFlightInfoError1.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be FlightNotFound error.');
      }).catch(err => assert(err instanceof AirFlightInfoRuntimeError.FlightNotFound, 'Should be FlightNotFound error.'));
    });

    it('should return `Airline not supported` error from flight info', () => {
      const uParser = new Parser('air:FlightInformationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_FLIGHT_INFORMATION;
      const xml = fs.readFileSync(`${xmlFolder}/AirFlightInfoError2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be AirlineNotSupported error.');
      }).catch(err => assert(err instanceof AirFlightInfoRuntimeError.AirlineNotSupported, 'Should be AirlineNotSupported error.'));
    });

    it('should return `Invalid flight number` error from flight info', () => {
      const uParser = new Parser('air:FlightInformationRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_FLIGHT_INFORMATION;
      const xml = fs.readFileSync(`${xmlFolder}/AirFlightInfoError3.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be InvalidFlightNumber error.');
      }).catch(err => assert(err instanceof AirFlightInfoRuntimeError.InvalidFlightNumber, 'Should be InvalidFlightNumber error.'));
    });
  });

  describe('AIR_EXCHANGE_QUOTE', () => {
    const testExchangeFormat = (result) => {
      expect(result).to.have.all.keys([
        'exchangeDetails',
        'exchangeToken',
        'exchangeTotal',
        'pricingDetails',
        'pricingInfo',
        'pricingSolution',
        'segments',
      ]);

      expect(result.exchangeDetails).to.be.an('array')
        .and.to.have.length.above(0);
      result.exchangeDetails.forEach((detail) => {
        expect(detail).to.have.all.keys([
          'addCollection',
          'changeFee',
          'exchangeAmount',
          'refund',
          'taxes',
          'uapi_pricing_info_ref',
        ]);
        expect(detail.taxes).to.be.an('array');
        detail.taxes.forEach((tax) => {
          expect(tax).to.have.all.keys(['type', 'value']);
          expect(tax.type).to.match(/[A-Z0-9]{2}/);
        });
      });

      expect(result.exchangeTotal).to.have.all.key([
        'addCollection',
        'changeFee',
        'exchangeAmount',
        'refund',
        'pricingTag',
      ]);

      expect(result.pricingDetails).to.have.all.key([
        'conversionRate',
        'discountApplies',
        'lowFareFound',
        'lowFarePricing',
        'penaltyApplies',
        'pricingType',
        'rateOfExchange',
        'validatingVendor',
      ]);

      expect(result.pricingDetails.conversionRate).to.be.a('number');
      expect(result.pricingDetails.rateOfExchange).to.be.a('number');
      expect(result.pricingDetails.discountApplies).to.be.a('boolean');
      expect(result.pricingDetails.lowFareFound).to.be.a('boolean');
      expect(result.pricingDetails.lowFarePricing).to.be.a('boolean');
      expect(result.pricingDetails.penaltyApplies).to.be.a('boolean');

      expect(result.pricingSolution).to.have.all.key([
        'basePrice',
        'equivalentBasePrice',
        'taxes',
        'totalPrice',
      ]);

      expect(result.segments).to.be.an('array').and.have.length.above(0);
      result.segments.forEach((segment) => {
        expect(segment).to.be.an('object');
        expect(segment).to.have.all.keys([
          'airline',
          'arrival',
          'bookingClass',
          'departure',
          'flightNumber',
          'from',
          'group',
          'serviceClass',
          'to',
          'uapi_segment_ref',
        ]);
        expect(segment.from).to.match(/^[A-Z]{3}$/);
        expect(segment.to).to.match(/^[A-Z]{3}$/);
        expect(segment.group).to.be.a('number');
        expect(new Date(segment.departure)).to.be.an.instanceof(Date);
        expect(new Date(segment.arrival)).to.be.an.instanceof(Date);
        expect(segment.airline).to.match(/^[A-Z0-9]{2}$/);
        expect(segment.flightNumber).to.match(/^\d+$/);
        expect(segment.serviceClass).to.be.oneOf([
          'Economy', 'Business', 'First', 'PremiumEconomy',
        ]);
        expect(segment.bookingClass).to.match(/^[A-Z]{1}$/);
      });

      expect(result.pricingInfo).to.be.an('array').and.have.length.above(0);
      result.pricingInfo.forEach((pricing) => {
        expect(pricing).to.have.all.keys([
          'basePrice',
          'bookingInfo',
          'equivalentBasePrice',
          'fareCalculation',
          'roe',
          'taxes',
          'totalPrice',
          'uapi_pricing_info_ref',
        ]);
        expect(pricing.roe).to.match(/\d+\.\d+/);
        expect(pricing.bookingInfo).to.be.an('array').and.have.length.above(0);
        pricing.bookingInfo.forEach((info) => {
          expect(info).to.have.all.keys([
            'baggage',
            'bookingCode',
            'cabinClass',
            'fareBasis',
            'from',
            'to',
            'uapi_segment_ref',
          ]);
          expect(info.baggage).to.be.an('object');
          expect(info.baggage).to.have.all.keys([
            'amount',
            'units',
          ]);
        });
      });
    };
    it('should test format', () => {
      const uParser = new Parser(null, 'v47_0', { });
      const parseFunction = airParser.AIR_EXCHANGE_QUOTE;
      const xml = fs.readFileSync(`${xmlFolder}/AirExchangeQuote-1.xml`).toString();
      return uParser.parse(xml).then(json => parseFunction.call(uParser, json)).then((result) => {
        testExchangeFormat(result);
      });
    });

    it('should test format2', () => {
      const uParser = new Parser(null, 'v47_0', { });
      const parseFunction = airParser.AIR_EXCHANGE_QUOTE;
      const xml = fs.readFileSync(`${xmlFolder}/AirExchangeQuote-2.xml`).toString();
      return uParser.parse(xml).then(json => parseFunction.call(uParser, json)).then((result) => {
        testExchangeFormat(result);
      });
    });

    it('should throw correct error if no residual value returned', () => {
      const uParser = new Parser('SOAP:Fault', 'v47_0', { });

      const parseFunction = airParser.AIR_ERRORS.bind(uParser);

      const xml = fs
        .readFileSync(`${xmlFolder}/AirExchangeQuote-error-no-residual-value.xml`)
        .toString();

      return uParser.parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          return parseFunction.call(uParser, errData);
        })
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.NoResidualValue);
        });
    });

    it('should throw correct error if no tickets exists', () => {
      const uParser = new Parser('SOAP:Fault', 'v47_0', { });

      const parseFunction = airParser.AIR_ERRORS.bind(uParser);

      const xml = fs
        .readFileSync(`${xmlFolder}/AirExchangeQuote-error-no-tickets.xml`)
        .toString();

      return uParser.parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          return parseFunction.call(uParser, errData);
        })
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.TicketsNotIssued);
        });
    });
  });

  describe('AIR_EXCHANGE', () => {
    it('should check if true returned in normal response', () => {
      const uParser = new Parser('air:AirExchangeRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_EXCHANGE;
      const xml = fs.readFileSync(`${xmlFolder}/AirExchange-1pas-1ticket.xml`).toString();
      return uParser.parse(xml).then(json => parseFunction.call(uParser, json)).then((result) => {
        expect(result).to.be.equal(true);
      });
    });

    it('should thow error for unknown response type', () => {
      const uParser = new Parser('air:AirExchangeRsp', 'v47_0', { });
      const parseFunction = airParser.AIR_EXCHANGE;
      const xml = fs.readFileSync(`${xmlFolder}/AirExchange-1pas-1ticket.xml`).toString();
      return uParser.parse(xml).then(() => parseFunction.call(uParser, {})).then(() => {
        throw new Error('Cant return result');
      }).catch((e) => {
        expect(e).to.be.instanceof(AirRuntimeError.CantDetectExchangeResponse);
      });
    });
  });

  describe('AIR_AVAILABILITY', () => {
    function testAvailability(rsp) {
      expect(rsp).to.have.all.keys(['legs', 'nextResultReference']);
      expect(rsp.legs).to.be.a('array');
      rsp.legs.forEach((leg) => {
        expect(leg).to.be.a('array');
        leg.forEach((segment) => {
          expect(segment).to.be.an('object');
          expect(segment).to.have.all.keys([
            'from', 'to', 'departure', 'arrival', 'airline',
            'flightNumber', 'plane', 'duration',
            'uapi_segment_ref', 'group', 'availability',
          ]);
          expect(segment.from).to.match(/^[A-Z]{3}$/);
          expect(segment.to).to.match(/^[A-Z]{3}$/);
          expect(new Date(segment.departure)).to.be.an.instanceof(Date);
          expect(new Date(segment.arrival)).to.be.an.instanceof(Date);
          expect(segment.airline).to.match(/^[A-Z0-9]{2}$/);
          expect(segment.flightNumber).to.match(/^\d+$/);
          if (segment.plane) {
            expect(segment.plane).to.be.a('string').and.to.have.length.above(0);
          }
          expect(segment.duration).to.be.an('string').and.to.have.length.above(0);
          expect(segment.uapi_segment_ref).to.be.a('string');

          expect(segment.availability).to.be.a('array');
          segment.availability.forEach((obj) => {
            expect(obj).to.have.all.keys(['bookingClass', 'cabin', 'seats']);
            expect(obj.seats).to.be.a('string');
          });
        });
      });

      return true;
    }
    it('should parse simple response', () => {
      const uParser = new Parser('air:AvailabilitySearchRsp', 'v47_0', {
        cabins: ['Economy'],
      });

      const parseFunction = airParser.AIR_AVAILABILITY;
      const xml = fs.readFileSync(`${xmlFolder}/AirAvailabilityRsp.xml`).toString();
      return uParser
        .parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testAvailability(result);
        });
    });

    it('should parse response with A and C availability', () => {
      const uParser = new Parser('air:AvailabilitySearchRsp', 'v47_0', {
        cabins: ['Economy'],
      });

      const parseFunction = airParser.AIR_AVAILABILITY;
      const xml = fs.readFileSync(`${xmlFolder}/AirAvailabilityRsp3.xml`).toString();
      return uParser
        .parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testAvailability(result);
        });
    });

    it('should parse response without connections', () => {
      const uParser = new Parser('air:AvailabilitySearchRsp', 'v47_0', {});

      const parseFunction = airParser.AIR_AVAILABILITY;
      const xml = fs.readFileSync(`${xmlFolder}/AirAvailabilityRsp2.xml`).toString();
      return uParser
        .parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testAvailability(result);
          expect(result.nextResultReference).to.be.null;
        });
    });

    it('should parse response with single connection', () => {
      const uParser = new Parser('air:AvailabilitySearchRsp', 'v47_0', {});

      const parseFunction = airParser.AIR_AVAILABILITY;
      const xml = fs.readFileSync(`${xmlFolder}/AirAvailabilityRsp-single-connection.xml`).toString();
      return uParser
        .parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testAvailability(result);
          expect(result.nextResultReference).to.be.null;
        });
    });

    it('should parse response without 1G avail info', () => {
      const uParser = new Parser('air:AvailabilitySearchRsp', 'v47_0', {});

      const parseFunction = airParser.AIR_AVAILABILITY;
      const xml = fs.readFileSync(`${xmlFolder}/AirAvailabilityRsp4-NO1G.xml`).toString();
      return uParser
        .parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          expect(result.legs.length).to.be.equal(0);
        });
    });

    it('should parse response without 1G avail info', () => {
      const uParser = new Parser('air:AvailabilitySearchRsp', 'v47_0', {});

      const parseFunction = airParser.AIR_AVAILABILITY;
      const xml = fs.readFileSync(`${xmlFolder}/AirAvailabilityRsp5.xml`).toString();
      return uParser
        .parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          expect(result.legs).to.have.length(7);
          expect(result.legs[0]).to.have.length(2);
        });
    });
  });

  describe('AIR_ERROR', () => {
    it('should correctly handle archived booking', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_ERRORS;
      const xml = fs.readFileSync(`${xmlFolder}/UnableToRetrieve.xml`).toString();
      return uParser.parse(xml)
        .then(
          (json) => {
            const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]); // parse error data
            return parseFunction.call(uParser, errData);
          }
        )
        .catch(
          (err) => {
            expect(err).to.be.an.instanceof(AirRuntimeError.UnableToRetrieve);
          }
        );
    });
    it('should correctly handle error of agreement', () => {
      const uParser = new Parser('air:LowFareSearchRsp', 'v47_0', {});
      const parseFunction = airParser.AIR_ERRORS;
      const xml = fs.readFileSync(`${xmlFolder}/NoAgreementError.xml`).toString();
      return uParser.parse(xml)
        .then(
          (json) => {
            const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]); // parse error data
            return parseFunction.call(uParser, errData);
          }
        )
        .catch(
          (err) => {
            expect(err).to.be.an.instanceof(AirRuntimeError.NoAgreement);
            expect(err.data.pcc).to.be.equal('7J8J');
          }
        );
    });
  });
});
