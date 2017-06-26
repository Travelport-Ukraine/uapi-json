import { expect } from 'chai';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import airParser from '../../src/Services/Air/AirParser';
import {
  AirFlightInfoRuntimeError,
  AirRuntimeError,
  AirParsingError,
} from '../../src/Services/Air/AirErrors';
import ParserUapi from '../../src/Request/uapi-parser';

const xmlFolder = path.join(__dirname, '..', 'FakeResponses', 'Air');
const timestampRegexp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[-+]{1}\d{2}:\d{2}/i;

const checkLowSearchFareXml = (filename) => {
  const uParser = new ParserUapi('air:LowFareSearchRsp', 'v33_0', {});
  const parseFunction = airParser.AIR_LOW_FARE_SEARCH_REQUEST;
  const xml = fs.readFileSync(filename).toString();
  return uParser.parse(xml).then((json) => {
    const result = parseFunction.call(uParser, json);
    expect(result).to.be.an('array').and.to.have.length.above(0);
    result.forEach(
      (proposal) => {
        expect(proposal).to.be.an('object');
        expect(proposal).to.have.all.keys([
          'totalPrice', 'basePrice', 'taxes', 'directions', 'bookingComponents',
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
                if (!leg.platingCarrier) {
                  console.log(leg);
                }
                expect(leg.platingCarrier).to.match(/^[A-Z0-9]{2}$/);
                expect(leg.segments).to.be.an('array').and.to.have.length.above(0);
                leg.segments.forEach(
                  (segment) => {
                    expect(segment).to.be.an('object');
                    expect(segment).to.have.all.keys([
                      'from', 'to', 'departure', 'arrival', 'airline', 'flightNumber', 'serviceClass',
                      'plane', 'duration', 'techStops', 'bookingClass', 'baggage', 'seatsAvailable',
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
                    expect(segment.seatsAvailable).to.be.a('number');
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
            expect(fare).to.have.all.keys([
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
        uapi_version: 'v36_0',
      }, {});
      expect(check).to.throw(AirParsingError.CancelResponseNotFound);
    });
    it('should return error when message do not contain Success message', () => {
      const check = () => airParser.AIR_CANCEL_PNR.call({
        uapi_version: 'v36_0',
      }, {
        'common_v36_0:ResponseMessage': [{
          _: 'Some message',
        }, {
          _: 'Another message',
        }],
      });
      expect(check).to.throw(AirParsingError.CancelResponseNotFound);
    });
    it('should return true if everything is ok', () => {
      const check = () => airParser.AIR_CANCEL_PNR.call({
        uapi_version: 'v36_0',
      }, {
        'common_v36_0:ResponseMessage': [{
          _: 'Itinerary Cancelled',
        }],
      });
      expect(check).not.to.throw(Error);
    });
  });
  describe('getTicket', () => {
    function testGetTicket(result) {
      expect(result).to.be.an('object');
      expect(result).to.have.all.keys([
        'uapi_ur_locator',
        'uapi_reservation_locator',
        'pnr',
        'platingCarrier',
        'ticketingPcc',
        'issuedAt',
        'fareCalculation',
        'farePricingMethod',
        'farePricingType',
        'priceInfoDetailsAvailable',
        'priceInfo',
        'passengers',
        'tickets',
      ]);
      expect(result.uapi_ur_locator).to.match(/^[A-Z0-9]{6}$/i);
      expect(result.uapi_reservation_locator).to.match(/^[A-Z0-9]{6}$/i);
      expect(result.pnr).to.match(/^[A-Z0-9]{6}$/i);
      expect(result.platingCarrier).to.match(/^[A-Z0-9]{2}$/i);
      expect(result.ticketingPcc).to.match(/^[A-Z0-9]{3,4}$/i);
      expect(result.issuedAt).to.match(timestampRegexp);
      expect(result.fareCalculation).to.have.length.above(0);
      // Price info
      expect(result.priceInfoDetailsAvailable).to.equal(true);
      const priceInfo = result.priceInfo;
      expect(priceInfo).to.be.an('object');
      expect(priceInfo).to.have.all.keys([
        'totalPrice', 'basePrice', 'taxes', 'taxesInfo', 'equivalentBasePrice',
        'noAdc',
      ]);
      expect(priceInfo.totalPrice).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
      expect(priceInfo.basePrice).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
      expect(priceInfo.taxes).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
      expect(priceInfo.taxesInfo).to.be.an('array');
      expect(priceInfo.taxesInfo).to.have.length.above(0);
      priceInfo.taxesInfo.forEach(
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
        expect(ticket).to.have.all.keys(['ticketNumber', 'coupons']);
        expect(ticket.ticketNumber).to.match(/\d{13}/i);
        expect(ticket.coupons).to.be.an('array');
        expect(ticket.coupons).to.have.length.above(0);
        ticket.coupons.forEach((coupon) => {
          expect(coupon).to.be.an('object');
          expect(coupon).to.have.all.keys([
            'couponNumber', 'from', 'to', 'departure', 'airline', 'flightNumber',
            'fareBasisCode', 'status', 'notValidBefore', 'notValidAfter',
            'bookingClass', 'serviceClass',
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
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_NOADC.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result).to.include.key('priceInfo');
          expect(result.priceInfoDetailsAvailable).to.equal(false);
          expect(result.priceInfo).to.be.an('object');
          expect(result.priceInfo.noAdc).to.equal(true);
          expect(result.priceInfo.totalPrice).to.equal(0);
        });
    });

    it('should return correct error for duplicate ticket number', () => {
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_DUPLICATE_TICKET.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then(() => Promise.reject(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.DuplicateTicketFound);
        });
    });

    it('should return default error if failure and code is not detected', () => {
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
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
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
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
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_IMPORTED.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testGetTicket(result);
        });
    });

    it('should parse imported ticket with single cabin class for all coupons', () => {
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_ONE_CABIN_CLASS.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testGetTicket(result);
        });
    });

    it('should parse ticket with XF and ZP taxes', () => {
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_XF_ZP.xml`).toString();
      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          testGetTicket(result);
          const detialedTaxes = result.priceInfo.taxesInfo.filter(
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
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_NOT_IMPORTED.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result).to.have.all.keys([
            'uapi_ur_locator',
            'uapi_reservation_locator',
            'pnr',
            'platingCarrier',
            'ticketingPcc',
            'issuedAt',
            'fareCalculation',
            'farePricingMethod',
            'farePricingType',
            'priceInfoDetailsAvailable',
            'priceInfo',
            'passengers',
            'tickets',
          ]);
          expect(result.uapi_ur_locator).to.match(/^[A-Z0-9]{6}$/i);
          expect(result.uapi_reservation_locator).to.match(/^[A-Z0-9]{6}$/i);
          expect(result.pnr).to.match(/^[A-Z0-9]{6}$/i);
          expect(result.platingCarrier).to.match(/^[A-Z0-9]{2}$/i);
          expect(result.ticketingPcc).to.match(/^[A-Z0-9]{3,4}$/i);
          expect(result.issuedAt).to.match(timestampRegexp);
          expect(result.fareCalculation).to.have.length.above(0);
          // Price info
          expect(result.priceInfoDetailsAvailable).to.equal(false);
          const priceInfo = result.priceInfo;
          expect(priceInfo).to.be.an('object');
          expect(priceInfo).to.have.all.keys([
            'totalPrice', 'basePrice', 'taxes', 'equivalentBasePrice', 'taxesInfo',
            'noAdc',
          ]);
          expect(priceInfo.totalPrice).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(priceInfo.basePrice).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(priceInfo.taxes).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(priceInfo.taxesInfo).to.be.an('array').and.to.have.lengthOf(0);
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
                'fareBasisCode', 'status', 'notValidBefore', 'notValidAfter', 'bookingClass',
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
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v33_0', {});
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
        const directions = result[0].directions;
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
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v33_0', {});
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
      const uParser = new ParserUapi('SOAP:Fault', 'v33_0', {});
      const parseFunction = airParser.AIR_ERRORS.bind(uParser);
      const json = fs.readFileSync(`${xmlFolder}/../Air/LowFaresSearch.NoSolutions.Parsed.error.json`).toString();
      return parseFunction(JSON.parse(json))
        .catch(err => expect(err).to.be.an.instanceof(AirRuntimeError.NoResultsFound));
    });

    it('should throw AirRuntimeError.NoResultsFound error3', () => {
      const uParser = new ParserUapi('SOAP:Fault', 'v33_0', {});
      const parseFunction = airParser.AIR_ERRORS.bind(uParser);
      const json = fs.readFileSync(`${xmlFolder}/../Air/LowFaresSearch.date-time-in-past.Parsed.error.json`).toString();
      return parseFunction(JSON.parse(json))
        .catch(err => expect(err).to.be.an.instanceof(AirRuntimeError.InvalidRequestData));
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

      const uParser = new ParserUapi(null, 'v36_0', { passengers });
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

      const uParser = new ParserUapi(null, 'v36_0', { passengers });
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

      const uParser = new ParserUapi(null, 'v36_0', { passengers });
      const parseFunction = airParser.AIR_PRICE_REQUEST_PRICING_SOLUTION_XML;
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.2AirPrice.xml`).toString();
      // const jsonSaved = fs.readFileSync(`${xmlFolder}/AirPricingSolution.2AirPrice.xml.json');
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        test(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });

  function testBooking(jsonResult) {
    expect(jsonResult).to.be.an('array');
    jsonResult.forEach((result) => {
      expect(result).to.be.an('object');
      // Checking object keys
      expect(result).to.have.all.keys([
        'version', 'uapi_ur_locator', 'uapi_reservation_locator',
        'uapi_airline_locator', 'bookingPCC', 'passengers', 'pnr', 'pnrList',
        'reservations', 'trips', 'hostCreatedAt', 'createdAt', 'modifiedAt', 'type', 'tickets',
      ]);
      expect(result.version).to.be.at.least(0);
      expect(result.uapi_ur_locator).to.match(/^[A-Z0-9]{6}$/);
      expect(result.uapi_reservation_locator).to.match(/^[A-Z0-9]{6}$/);
      expect(result.uapi_airline_locator).to.match(/^[A-Z0-9]{6}$/);
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
      // Checking pnrList format
      expect(result.pnrList).to.be.an('array');
      expect(result.pnrList).to.have.length.above(0);
      result.pnrList.forEach((pnr) => {
        expect(pnr).to.match(/^[A-Z0-9]{6}$/);
      });
      // Checking reservations format
      expect(result.reservations).to.be.an('array');
      result.reservations.forEach((reservation) => {
        expect(reservation).to.be.an('object');
        expect(reservation).to.include.all.keys([
          'status',
          'fareCalculation',
          'farePricingMethod',
          'farePricingType',
          'priceInfo',
          'baggage',
          'timeToReprice',
          'uapi_segment_refs',
          'uapi_passenger_refs',
          'uapi_pricing_info_ref',
        ]);
        if (reservation.platingCarrier) {
          expect(reservation.platingCarrier).to.match(/^[A-Z0-9]{2}$/);
        }
        expect(reservation.status).to.be.oneOf(['Reserved', 'Ticketed']);
        expect(reservation.fareCalculation).to.be.a('string');
        expect(reservation.fareCalculation).to.have.length.above(0);
        expect(new Date(reservation.timeToReprice)).to.be.an.instanceof(Date);
        // Checking Price info
        expect(reservation.priceInfo).to.be.an('object');
        expect(reservation.priceInfo).to.include.keys([
          'totalPrice', 'basePrice', 'equivalentBasePrice', 'taxes', 'passengersCount',
          'taxesInfo',
        ]);
        expect(reservation.priceInfo.passengersCount).to.be.an('object');
        Object.keys(reservation.priceInfo.passengersCount).forEach(
          ptc => expect(reservation.priceInfo.passengersCount[ptc]).to.be.a('number')
        );
        expect(reservation.priceInfo.taxesInfo).to.be.an('array');
        reservation.priceInfo.taxesInfo.forEach(
          (tax) => {
            expect(tax).to.be.an('object');
            expect(tax.value).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
            expect(tax.type).to.match(/^[A-Z]{2}$/);
          }
        );
        // Checking baggage
        expect(reservation.baggage).to.be.an('array');
        reservation.baggage.forEach(
          (baggage) => {
            expect(baggage).to.be.an('object');
            expect(baggage).to.have.all.keys(['units', 'amount']);
            expect(baggage.units).to.be.a('string');
            expect(baggage.amount).to.be.a('number');
          }
        );
        // Segment references
        expect(reservation.uapi_segment_refs).to.be.an('array');
        expect(reservation.uapi_segment_refs).to.have.length.above(0);
        reservation.uapi_segment_refs.forEach(
          reference => expect(reference).to.be.a('string')
        );
        // Passenger references
        expect(reservation.uapi_passenger_refs).to.be.an('array');
        expect(reservation.uapi_passenger_refs).to.have.length.above(0);
        reservation.uapi_passenger_refs.forEach(
          reference => expect(reference).to.be.a('string')
        );
      });
      // Checking reservations format
      expect(result.trips).to.be.an('array');
      result.trips.forEach(
        (trip) => {
          expect(trip).to.be.an('object');
          expect(trip).to.have.all.keys([
            'from', 'to', 'bookingClass', 'departure', 'arrival', 'airline',
            'flightNumber', 'serviceClass', 'status', 'plane', 'duration',
            'techStops', 'group', 'uapi_segment_ref',
          ]);
          expect(trip.from).to.match(/^[A-Z]{3}$/);
          expect(trip.to).to.match(/^[A-Z]{3}$/);
          expect(trip.bookingClass).to.match(/^[A-Z]{1}$/);
          expect(new Date(trip.departure)).to.be.an.instanceof(Date);
          expect(new Date(trip.arrival)).to.be.an.instanceof(Date);
          expect(trip.airline).to.match(/^[A-Z0-9]{2}$/);
          expect(trip.flightNumber).to.match(/^\d+$/);
          expect(trip.serviceClass).to.be.oneOf([
            'Economy', 'Business', 'First', 'PremiumEconomy',
          ]);
          expect(trip.status).to.match(/^[A-Z]{2}$/);
          // Planes
          expect(trip.plane).to.be.an('array').and.to.have.length.above(0);
          trip.plane.forEach(plane => expect(plane).to.be.a('string'));
          // Duration
          expect(trip.duration).to.be.an('array').and.to.have.length.above(0);
          trip.duration.forEach(duration => expect(duration).to.match(/^\d+$/));
          // Tech stops
          expect(trip.techStops).to.be.an('array');
          trip.techStops.forEach(stop => expect(stop).to.match(/^[A-Z]{3}$/));
          // Segment reference
          expect(trip.uapi_segment_ref).to.be.a('string');
        }
      );
      // Checking tickets
      expect(result.tickets).to.be.an('array');
      if (result.tickets.length > 0) {
        result.tickets.forEach(
          (ticket) => {
            expect(ticket).to.be.an('object').and.to.have.all.keys([
              'number', 'uapi_passenger_ref', 'uapi_pricing_info_ref'
            ]);
            expect(ticket.number).to.match(/\d{13}/);
            expect(ticket.uapi_passenger_ref).to.be.a('string');
          }
        );
      }
    });
  }

  describe('AIR_CREATE_RESERVATION()', () => {
    it('should parse booking with XF and ZP taxes in FQ', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/getPNR_XF_ZP.xml`).toString();
      return uParser.parse(xml)
      .then(json => parseFunction.call(uParser, json))
      .then((result) => {
        testBooking(result);
        const detialedTaxes = result[0].reservations[0].priceInfo.taxesInfo.filter(
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

    it('should test parsing of create reservation 2ADT1CNN', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.2ADT1CNN.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT (2)', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT (3)', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of reservation with no valid fare error', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.SegmentFailure.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be SegmentBookingFailed error.');
      }).catch((err) => {
        assert(err, 'No error returner');
        assert(err instanceof AirRuntimeError.SegmentBookingFailed, 'Should be SegmentBookingFailed error.');
      });
    });

    it('should test parsing of reservation with segment failure', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.NOVALIDFARE.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be NoValidFare error.');
      }).catch((err) => {
        assert(err, 'No error returner');
        assert(err instanceof AirRuntimeError.NoValidFare, 'Should be NoValidFare error.');
      });
    });
  });

  describe('AIR_TICKET_REQUEST', () => {
    it('should test parsing ticketing response', () => {
      const uParser = new ParserUapi('air:AirTicketingRsp', 'v33_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
      });
    });

    it('should auto detect version and parse 36 version', () => {
      const uParser = new ParserUapi('air:AirTicketingRsp', 'v33_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing36.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
      });
    });

    it('should test parsing ticketing response', () => {
      const uParser = new ParserUapi('air:AirTicketingRsp', 'v33_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
      });
    });

    it('should throw parsing error TicketingResponseMissing', () => {
      const uParser = new ParserUapi('air:AirTicketingRsp', 'v33_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.NOT-OK.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should not return response.');
      }).catch((e) => {
        assert(e instanceof AirRuntimeError.TicketingResponseMissing);
      });
    });
  });

  describe('UNIVERSAL_RECORD_IMPORT_SIMPLE_REQUEST', () => {
    it('should test parsing of universal record import request', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should test parsing of universal record import request 2', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should parse pnr without segments', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', {});
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/importPNR.noSegments.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should parse pnr having fare quotes without taxes', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', {});
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/importPNR.fq.noTaxes.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should test parsing of universal record import request with tickets', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.Ticket.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false, true);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of universal record import request with tickets (multiple passengers)', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.MultiplePassengers.Ticket.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false, true);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });

  describe('AIR_CANCEL_UR', () => {
    it('parse cancel by UR', () => {
      const uParser = new ParserUapi(null, 'v36_0', { });
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
      const uParser = new ParserUapi('air:FlightInformationRsp', 'v35_0', { });
      const parseFunction = airParser.AIR_FLIGHT_INFORMATION;
      const xml = fs.readFileSync(`${xmlFolder}/AirFlightInfo.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should return `Flight not found` error from flight info', () => {
      const uParser = new ParserUapi('air:FlightInformationRsp', 'v35_0', { });
      const parseFunction = airParser.AIR_FLIGHT_INFORMATION;
      const xml = fs.readFileSync(`${xmlFolder}/AirFlightInfoError1.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be FlightNotFound error.');
      }).catch(err => assert(err instanceof AirFlightInfoRuntimeError.FlightNotFound, 'Should be FlightNotFound error.'));
    });

    it('should return `Airline not supported` error from flight info', () => {
      const uParser = new ParserUapi('air:FlightInformationRsp', 'v35_0', { });
      const parseFunction = airParser.AIR_FLIGHT_INFORMATION;
      const xml = fs.readFileSync(`${xmlFolder}/AirFlightInfoError2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        parseFunction.call(uParser, json);
        assert(false, 'Should be AirlineNotSupported error.');
      }).catch(err => assert(err instanceof AirFlightInfoRuntimeError.AirlineNotSupported, 'Should be AirlineNotSupported error.'));
    });

    it('should return `Invalid flight number` error from flight info', () => {
      const uParser = new ParserUapi('air:FlightInformationRsp', 'v35_0', { });
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
        detail.taxes.forEach(tax => {
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
          'taxes',
          'totalPrice',
          'uapi_pricing_info_ref',
        ]);
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
      const uParser = new ParserUapi(null, 'v36_0', { });
      const parseFunction = airParser.AIR_EXCHANGE_QUOTE;
      const xml = fs.readFileSync(`${xmlFolder}/AirExchangeQuote-1.xml`).toString();
      return uParser.parse(xml).then((json) => {
        return parseFunction.call(uParser, json);
      }).then(result => {
        testExchangeFormat(result);
      });
    });

    it('should test format2', () => {
      const uParser = new ParserUapi(null, 'v36_0', { });
      const parseFunction = airParser.AIR_EXCHANGE_QUOTE;
      const xml = fs.readFileSync(`${xmlFolder}/AirExchangeQuote-2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        return parseFunction.call(uParser, json);
      }).then(result => {
        testExchangeFormat(result);
      });
    });

    it('should throw correct error if no residual value returned', () => {
      const uParser = new ParserUapi('SOAP:Fault', 'v36_0', { });

      const parseFunction = airParser.AIR_ERRORS.bind(uParser);

      const xml = fs
        .readFileSync(`${xmlFolder}/AirExchangeQuote-error-no-residual-value.xml`)
        .toString();

      return uParser.parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          return parseFunction.call(uParser, errData);
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(AirRuntimeError.NoResidualValue);
        });
    });

    it('should throw correct error if no tickets exists', () => {
      const uParser = new ParserUapi('SOAP:Fault', 'v36_0', { });

      const parseFunction = airParser.AIR_ERRORS.bind(uParser);

      const xml = fs
        .readFileSync(`${xmlFolder}/AirExchangeQuote-error-no-tickets.xml`)
        .toString();

      return uParser.parse(xml)
        .then((json) => {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]);
          return parseFunction.call(uParser, errData);
        })
        .catch(err => {
          expect(err).to.be.an.instanceof(AirRuntimeError.TicketsNotIssued);
        });
    });
  });

  describe('AIR_EXCHANGE', () => {
    it('should check if true returned in normal response', () => {
      const uParser = new ParserUapi('air:AirExchangeRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_EXCHANGE;
      const xml = fs.readFileSync(`${xmlFolder}/AirExchange-1pas-1ticket.xml`).toString();
      return uParser.parse(xml).then((json) => {
        return parseFunction.call(uParser, json);
      }).then(result => {
        expect(result).to.be.equal(true);
      });
    });

    it('should thow error for unknown response type', () => {
      const uParser = new ParserUapi('air:AirExchangeRsp', 'v36_0', { });
      const parseFunction = airParser.AIR_EXCHANGE;
      const xml = fs.readFileSync(`${xmlFolder}/AirExchange-1pas-1ticket.xml`).toString();
      return uParser.parse(xml).then((json) => {
        return parseFunction.call(uParser, {});
      }).then(result => {
        throw new Error('Cant return result');
      }).catch(e => {
        expect(e).to.be.instanceof(AirRuntimeError.CantDetectExchangeReponse);
      });
    });
  });
});
