import moment from 'moment';
import _ from 'lodash';
import airService from './AirService';
import { AirRuntimeError } from './AirErrors';

module.exports = (settings) => {
  const service = airService(settings);
  return {
    shop(options) {
      return service.searchLowFares(options);
    },

    toQueue(options) {
      return service.gdsQueue(options);
    },

    book(options) {
      return service.airPricePricingSolutionXML(options).then((data) => {
        const bookingParams = Object.assign({}, {
          passengers: options.passengers,
          rule: options.rule,
          ticketDate: moment().add(3, 'hours').format(),
          ActionStatusType: 'TAU',
        }, data);
        return service.createReservation(bookingParams).catch((err) => {
          if (err instanceof AirRuntimeError.SegmentBookingFailed
              || err instanceof AirRuntimeError.NoValidFare) {
            const code = err.data['universal:UniversalRecord'].LocatorCode;
            return service.cancelUR({
              LocatorCode: code,
            }).then(() => {
              throw err;
            }).catch(() => {
              if (settings.debug > 0) {
                console.log('Cant cancel booking with UR', code);
              }
              throw err;
            });
          }
          throw err;
        });
      });
    },

    importPNR(options) {
      return service.importPNR(options);
    },

    ticket(options) {
      return service.importPNR(options).then((data) => {
        const ticketParams = Object.assign({}, options, {
          ReservationLocator: data[0].uapi_reservation_locator,
        });
        return service.ticket(ticketParams)
          .then(result => result, (err) => {
            if (err instanceof AirRuntimeError.TicketingFoidRequired) {
              return service.importPNR(options)
                .then(booking => service.foid(booking[0]))
                .then(() => service.ticket(ticketParams));
            }
            return Promise.reject(err);
          });
      });
    },

    flightInfo(options) {
      const parameters = {
        flightInfoCriteria: _.isArray(options) ? options : [options],
      };
      return service.flightInfo(parameters)
        .then(data => data)
        .catch((err) => {
          if (settings.debug > 0) {
            console.log('Cant get flightInfo', err);
          }
          Promise.reject(err);
        });
    },
  };
};
