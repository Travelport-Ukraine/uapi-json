/*
  eslint-disable import/no-extraneous-dependencies
*/
import { expect } from 'chai';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

import airParser from '../../src/Services/Air/AirParser';
import {
  AirFlightInfoRuntimeError,
  AirRuntimeError,
} from '../../src/Services/Air/AirErrors';
import ParserUapi from '../../src/Request/uapi-parser';

const xmlFolder = path.join(__dirname, '..', 'FakeResponses', 'Air');
const timestampRegexp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[-+]{1}\d{2}:\d{2}/i;

describe('#AirParser', () => {
  describe('getTicket', () => {
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
          expect(result).to.be.an('object');
          expect(result).to.have.all.keys([
            'type', 'uapi_ur_locator', 'uapi_reservation_locator', 'pnr', 'platingCarrier',
            'ticketingPcc', 'issuedAt', 'fareCalculation', 'priceInfo', 'passengers', 'tickets',
          ]);
          expect(result.type).to.equal('airTicketDocument');
          expect(result.uapi_ur_locator).to.match(/^[A-Z0-9]{6}$/i);
          expect(result.uapi_reservation_locator).to.match(/^[A-Z0-9]{6}$/i);
          expect(result.pnr).to.match(/^[A-Z0-9]{6}$/i);
          expect(result.platingCarrier).to.match(/^[A-Z0-9]{2}$/i);
          expect(result.ticketingPcc).to.match(/^[A-Z0-9]{3,4}$/i);
          expect(result.issuedAt).to.match(timestampRegexp);
          expect(result.fareCalculation).to.have.length.above(0);
          // Price info
          const priceInfo = result.priceInfo;
          expect(priceInfo).to.be.an('object');
          expect(priceInfo).to.have.all.keys([
            'TotalPrice', 'BasePrice', 'Taxes', 'TaxesInfo', 'EquivalentBasePrice',
          ]);
          expect(priceInfo.TotalPrice).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(priceInfo.BasePrice).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(priceInfo.Taxes).to.match(/[A-Z]{3}(?:\d+\.)?\d+/i);
          expect(priceInfo.TaxesInfo).to.be.an('array');
          expect(priceInfo.TaxesInfo).to.have.length.above(0);
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
    it('should fail if ticket info is incomplete', (done) => {
      const uParser = new ParserUapi('air:AirRetrieveDocumentRsp', 'v39_0', {});
      const parseFunction = airParser.AIR_GET_TICKET;
      const xml = fs.readFileSync(`${xmlFolder}/getTicket_NOT_IMPORTED.xml`).toString();

      return uParser.parse(xml)
        .then(json => parseFunction.call(uParser, json))
        .then(() => done(new Error('Error has not occured')))
        .catch((err) => {
          expect(err).to.be.an.instanceof(AirRuntimeError.TicketInfoIncomplete);
          done();
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
        assert(result[0].BasePrice, 'No base price.');
        assert(result[0].Taxes, 'No taxes.');
        assert(result[0].TotalPrice, 'No total price.');
        assert(result[0].Directions, 'No Directions.');
        assert(result[0].BookingComponents, 'No Booking components.');
        assert(result[0].Directions.length, 'Directions length not 2.');
        const directions = result[0].Directions;
        const first = directions[0][0];
        const second = directions[1][0];
        assert(directions[0].length === 1, 'From direction length shoudl be 1');
        assert(first.Segments, 'No segments in dir[0][0]');
        assert(second.Segments, 'No segments in dir[1][0]');

        assert(first.from, 'No from  in dir[0][0]');
        assert(first.to, 'No to  in dir[0][0]');
        assert(first.platingCarrier, 'No PC in dir[0][0]');
        const segment = first.Segments[0];
        assert(segment.arrival, 'Segement should have arrival');
        assert(segment.departure, 'Segement should have departure');
        assert(segment.bookingClass, 'Segement should have bookingClass');
        assert(segment.fareBasisCode, 'Segement should have fareBasisCode');
        assert(segment.from, 'Segement should have from');
        assert(segment.to, 'Segement should have to');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should compare xml with parsed json', () => {
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v33_0', {});
      const parseFunction = airParser.AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`).toString();
      const jsonResult = JSON.parse(
        fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.json`).toString()
      );
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        assert(JSON.stringify(result) === JSON.stringify(jsonResult), 'Results are not equal.');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should compare xml with parsed json', () => {
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v33_0', {});
      const parseFunction = airParser.AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.1ADTIEVPAR.xml`).toString();
      const jsonResult = JSON.parse(
        fs.readFileSync(`${xmlFolder}/LowFaresSearch.1ADTIEVPAR.json`).toString()
      );
      return uParser.parse(xml).then((json) => {
        const result = parseFunction.call(uParser, json);
        assert(JSON.stringify(result) === JSON.stringify(jsonResult), 'Results are not equal.');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should throw AirRuntimeError.NoResultsFound error', () => {
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v33_0', {});
      const parseFunction = airParser.AIR_ERRORS;
      const xml = fs.readFileSync(`${xmlFolder}/../Other/UnableToFareQuoteError.xml`).toString();
      return uParser.parse(xml).then((json) => {
        try {
          const errData = uParser.mergeLeafRecursive(json['SOAP:Fault'][0]); // parse error data
          parseFunction.call(uParser, errData);
        } catch (e) {
          assert(e instanceof AirRuntimeError.NoResultsFound, 'Incorrect error thrown');
          return;
        }
        assert(false, 'Incorrect logic of unable to fare quote parsing');
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

  function testBooking(jsonResult, platingCarrier = true, tickets = false) {
    assert(_.isArray(jsonResult), 'result not array');
    jsonResult.forEach((result) => {
      assert(result.version, 'no version');
      assert(result.uapi_ur_locator, 'no ur locator');
      assert(result.uapi_reservation_locator, 'no reservation locator');
      assert(result.uapi_airline_locator, 'no airline locator');
      assert(result.bookingPCC, 'no booking pcc');
      assert(result.platingCarrier, 'no PC');
      assert(_.isArray(result.passengers), 'passengers is not array');
      assert(result.passengers.length);
      assert(result.pnr, 'no pnr');
      assert(_.isArray(result.pnrList), 'no pnrList');
      assert(_.isArray(result.reservations), 'no reservations');
      assert(result.reservations.length);
      assert(_.isArray(result.trips), 'no trips');
      result.trips.forEach((trip) => {
        assert(_.isArray(trip.baggage), 'No baggage in trips');
      });

      result.reservations.forEach((reservation) => {
        let status = 'Reserved';
        if (tickets) {
          status = 'Ticketed';
        }
        assert(reservation.status === status);
        assert(!_.isEmpty(reservation.priceInfo), 'no price info');
        assert(_.isEqual(
          Object.keys(reservation.priceInfo),
          ['TotalPrice', 'BasePrice', 'Taxes', 'passengersCount', 'TaxesInfo']
        ), 'no required fields');
      });

      if (tickets) {
        assert(_.isArray(result.tickets), 'No tickets in result');
        assert(result.tickets.length === result.passengers.length, 'tickets should be for each passenger');
        result.tickets.forEach((ticket) => {
          assert(!_.isEmpty(ticket.number), 'No ticket number');
          assert(!_.isEmpty(ticket.uapi_passenger_ref), 'No passenger_ref in tickets');
        });
      }

      if (platingCarrier) {
        assert(!_.isEmpty(result.platingCarrier), 'no plating carrier');
      }
    });
  }

  describe('AIR_CREATE_RESERVATION()', () => {
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

    it('should test parsing ticketing response', () => {
      const uParser = new ParserUapi('air:AirTicketingRsp', 'v33_0', { });
      const parseFunction = airParser.AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.2.xml`).toString();
      return uParser.parse(xml).then((json) => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
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
});
