var proxy  = require('proxyquire');
var sinon  = require('sinon');
var assert = require('assert');
var fs = require('fs');
var _ = require('lodash');

const ParserUapi = require('../../src/uapi-parser');
const xmlFolder = __dirname + '/../FakeResponses/Air';
describe('#AirParser', function () {
  describe('AIR_LOW_FARE_SEARCH()', () => {
    it('should test parsing of low fare search request', () => {
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v_33_0', {});
      const parseFunction = require('../../src/Air/AirParser').AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`).toString();

      return uParser.parse(xml).then(json => {
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
        assert(directions[0].length == 1, 'From direction length shoudl be 1');
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
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v_33_0', {});
      const parseFunction = require('../../src/Air/AirParser').AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.2ADT1CNNIEVBKK.xml`).toString();
      const jsonResult = require('../FakeResponses/Air/LowFaresSearch.2ADT1CNNIEVBKK.json');
      return uParser.parse(xml).then(json => {
        const result = parseFunction.call(uParser, json);
        assert(JSON.stringify(result) === JSON.stringify(jsonResult), 'Results are not equal.');
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should compare xml with parsed json', () => {
      const uParser = new ParserUapi('air:LowFareSearchRsp', 'v_33_0', {});
      const parseFunction = require('../../src/Air/AirParser').AIR_LOW_FARE_SEARCH_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/LowFaresSearch.1ADTIEVPAR.xml`).toString();
      const jsonResult = require('../FakeResponses/Air/LowFaresSearch.1ADTIEVPAR.json');
      return uParser.parse(xml).then(json => {
        const result = parseFunction.call(uParser, json);
        assert(JSON.stringify(result) === JSON.stringify(jsonResult), 'Results are not equal.');
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
    }

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

      const uParser = new ParserUapi(null, 'v_36_0', { passengers });
      const parseFunction = require('../../src/Air/AirParser').AIR_PRICE_REQUEST_PRICING_SOLUTION_XML;
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.IEVPAR.xml`).toString();
      const jsonSaved = require('../FakeResponses/Air/AirPricingSolution.IEVPAR.json');
      return uParser.parse(xml).then(json => {
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

      const uParser = new ParserUapi(null, 'v_36_0', { passengers });
      const parseFunction = require('../../src/Air/AirParser').AIR_PRICE_REQUEST_PRICING_SOLUTION_XML;
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.IEVPAR.2ADT1CNN.xml`).toString();
      const jsonSaved = require('../FakeResponses/Air/AirPricingSolution.IEVPAR.2ADT1CNN.json');
      return uParser.parse(xml).then(json => {
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

      const uParser = new ParserUapi(null, 'v_36_0', { passengers });
      const parseFunction = require('../../src/Air/AirParser').AIR_PRICE_REQUEST_PRICING_SOLUTION_XML;
      const xml = fs.readFileSync(`${xmlFolder}/AirPricingSolution.2AirPrice.xml`).toString();
      // const jsonSaved = require('../FakeResponses/Air/AirPricingSolution.2AirPrice.xml.json');
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        test(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    })
  });

  function testBooking(jsonResult, platingCarrier = true, tickets = false) {
    assert(_.isArray(jsonResult), 'result not array');
    jsonResult.forEach(result => {
      assert(result.bookingPCC, 'no booking pcc');
      assert(result.platingCarrier, 'no PC');
      assert(_.isArray(result.passengers), 'passengers is not array');
      assert(result.passengers.length);
      assert(result.pnr, 'no pnr');
      assert(_.isArray(result.pnrList), 'no pnrList');
      assert(_.isArray(result.reservations), 'no reservations');
      assert(result.reservations.length);
      assert(_.isArray(result.trips), 'no trips');
      result.trips.forEach(trip => {
        assert(_.isArray(trip.baggage), 'No baggage in trips');
      });

      result.reservations.forEach(reservation => {
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
        result.tickets.forEach(ticket => {
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
      const parseFunction = require('../../src/Air/AirParser').AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.2ADT1CNN.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT (2)', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of create reservation 1ADT (3)', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.1ADT.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of reservation with segment failure', () => {
      const uParser = new ParserUapi('universal:AirCreateReservationRsp', 'v36_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_CREATE_RESERVATION_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirCreateReservation.SegmentFailure.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(false, 'There should be error');
      }).catch(err => {
        assert(err, 'No error returner');
      });
    });
  });

  describe('AIR_TICKET_REQUEST', () => {
    it('should test parsing ticketing response', () => {
      const uParser = new ParserUapi('air:AirTicketingRsp', 'v33_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
      });
    });

    it('should test parsing ticketing response', () => {
      const uParser = new ParserUapi('air:AirTicketingRsp', 'v33_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_TICKET_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/AirTicketing.2.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        assert(jsonResult, true, 'Ticketing is not true');
      });
    });
  });

  describe('UNIVERSAL_RECORD_IMPORT_SIMPLE_REQUEST', () => {
    it('should test parsing of universal record import request', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false);
      });
    });

    it('should test parsing of universal record import request with tickets', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.Ticket.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json)
        testBooking(jsonResult, false, true);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });

    it('should test parsing of universal record import request with tickets (multiple passengers)', () => {
      const uParser = new ParserUapi('universal:UniversalRecordImportRsp', 'v36_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_IMPORT_REQUEST;
      const xml = fs.readFileSync(`${xmlFolder}/UniversalRecordImport.MultiplePassengers.Ticket.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json);
        testBooking(jsonResult, false, true);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });

  describe('AIR_CANCEL_UR', () => {
    it('parse cancel by UR', () => {
      const uParser = new ParserUapi(null, 'v36_0', { });
      const parseFunction = require('../../src/Air/AirParser').AIR_CANCEL_UR;
      const xml = fs.readFileSync(`${xmlFolder}/AirCancelUR.xml`).toString();
      return uParser.parse(xml).then(json => {
        const jsonResult = parseFunction.call(uParser, json)
        assert(jsonResult);
      }).catch(err => assert(false, 'Error during parsing' + err.stack));
    });
  });
});
