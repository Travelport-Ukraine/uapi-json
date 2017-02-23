/*
  eslint-disable import/no-extraneous-dependencies
*/
import { expect } from 'chai';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import airParser from '../../src/Services/Air/AirParser';
import {
  AirFlightInfoRuntimeError,
  AirRuntimeError,
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
                      'uapi_segment_ref',
                    ]);
                    expect(segment.from).to.match(/^[A-Z]{3}$/);
                    expect(segment.to).to.match(/^[A-Z]{3}$/);
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
            'uapi_ur_locator', 'uapi_reservation_locator', 'pnr', 'platingCarrier',
            'ticketingPcc', 'issuedAt', 'fareCalculation', 'priceInfo', 'passengers', 'tickets',
          ]);
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

    it('should throw AirRuntimeError.NoResultsFound error2', () => {
      const uParser = new ParserUapi('SOAP:Fault', 'v33_0', {});
      const parseFunction = airParser.AIR_ERRORS.bind(uParser);
      const json = fs.readFileSync(`${xmlFolder}/../Air/LowFaresSearch.NoSolutions.Parsed.error.json`).toString();
      try {
        parseFunction(JSON.parse(json));
      } catch (e) {
        assert(e instanceof AirRuntimeError.NoResultsFound, 'Incorrect error class');
        return;
      }
      assert(false, 'No error thrown');
    });

    it('should throw AirRuntimeError.NoResultsFound error3', () => {
      const uParser = new ParserUapi('SOAP:Fault', 'v33_0', {});
      const parseFunction = airParser.AIR_ERRORS.bind(uParser);
      const json = fs.readFileSync(`${xmlFolder}/../Air/LowFaresSearch.date-time-in-past.Parsed.error.json`).toString();
      try {
        parseFunction(JSON.parse(json));
      } catch (e) {
        assert(e instanceof AirRuntimeError.InvalidRequestData, 'Incorrect error class');
        return;
      }
      assert(false, 'No error thrown');
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
    const bookingKeys = [
      'version', 'uapi_ur_locator', 'uapi_reservation_locator',
      'uapi_airline_locator', 'bookingPCC', 'platingCarrier',
      'passengers', 'pnr', 'pnrList', 'reservations', 'trips',
      'createdAt', 'modifiedAt', 'type',
    ].concat(tickets ? 'tickets' : []);
    expect(jsonResult).to.be.an('array');
    jsonResult.forEach((result) => {
      expect(result).to.be.an('object');
      // Checking object keys
      expect(result).to.have.all.keys(bookingKeys);
      expect(result.version).to.be.at.least(0);
      expect(result.uapi_ur_locator).to.match(/^[A-Z0-9]{6}$/);
      expect(result.uapi_reservation_locator).to.match(/^[A-Z0-9]{6}$/);
      expect(result.uapi_airline_locator).to.match(/^[A-Z0-9]{6}$/);
      expect(result.bookingPCC).to.match(/^[A-Z0-9]{3,4}$/);
      expect(result.platingCarrier).to.match(/^[A-Z0-9]{2}$/);
      expect(result.pnr).to.match(/^[A-Z0-9]{6}$/);
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
      expect(result.reservations).to.have.length.above(0);
      result.reservations.forEach((reservation) => {
        expect(reservation).to.be.an('object');
        expect(reservation).to.have.all.keys([
          'status', 'fareCalculation', 'priceInfo', 'baggage', 'timeToReprice',
          'uapi_segment_refs', 'uapi_passenger_refs',
        ]);
        expect(reservation.status).to.be.oneOf(['Reserved', 'Ticketed']);
        expect(reservation.fareCalculation).to.be.a('string');
        expect(reservation.fareCalculation).to.have.length.above(0);
        expect(new Date(reservation.timeToReprice)).to.be.an.instanceof(Date);
        // Checking Price info
        expect(reservation.priceInfo).to.be.an('object');
        expect(reservation.priceInfo).to.include.keys([
          'totalPrice', 'basePrice', 'equivalentBasePrice', 'taxes', 'passengersCount',
        ]);
        expect(reservation.priceInfo.passengersCount).to.be.an('object');
        Object.keys(reservation.priceInfo.passengersCount).forEach(
          ptc => expect(reservation.priceInfo.passengersCount[ptc]).to.be.a('number')
        );
        if (reservation.priceInfo.taxesInfo) {
          expect(reservation.priceInfo.taxesInfo).to.be.an('array');
          expect(reservation.priceInfo.taxesInfo).to.have.length.above(0);
          reservation.priceInfo.taxesInfo.forEach(
            (tax) => {
              expect(tax).to.be.an('object');
              expect(tax.value).to.match(/^[A-Z]{3}(\d+\.)?\d+$/);
              expect(tax.type).to.match(/^[A-Z]{2}$/);
            }
          );
        }
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
      expect(result.trips).to.have.length.above(0);
      result.trips.forEach(
        (trip) => {
          expect(trip).to.be.an('object');
          expect(trip).to.have.all.keys([
            'from', 'to', 'bookingClass', 'departure', 'arrival', 'airline',
            'flightNumber', 'serviceClass', 'status', 'plane', 'duration',
            'techStops', 'uapi_segment_ref',
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

      if (result.tickets) {
        expect(result.tickets).to.be.an('array').and.to.have.length.above(0);
        result.tickets.forEach(
          (ticket) => {
            expect(ticket).to.be.an('object').and.to.have.all.keys([
              'number', 'uapi_passenger_ref',
            ]);
            expect(ticket.number).to.match(/\d{13}/);
            expect(ticket.uapi_passenger_ref).to.be.a('string');
          }
        );
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
