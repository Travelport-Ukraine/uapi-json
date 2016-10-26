import moment from 'moment';
import airServiceInternal from './AirServiceInternal';
import { AirRuntimeError } from './AirErrors';

module.exports = (settings) => {
  const { auth, debug, production } = settings;
  return {
    shop(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.searchLowFares(options);
    },

    toQueue(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.gdsQueue(options);
    },

    book(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.airPricePricingSolutionXML(options).then((data) => {
        const bookingParams = Object.assign({}, {
          passengers: options.passengers,
          rule: options.rule,
          ticketingPcc: auth.pcc.toUpperCase(),
          ticketDate: moment().add(1, 'day').format(),
          ActionStatusType: 'TAW',
        }, data);
        return AirService.createReservation(bookingParams).catch((err) => {
          if (err instanceof AirRuntimeError.SegmentBookingFailed) {
            const code = err.data['universal:UniversalRecord'].LocatorCode;
            return AirService.cancelUR({
              LocatorCode: code,
            }).then(() => {
              throw err;
            }).catch(() => {
              if (debug > 0) {
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
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.importPNR(options);
    },

    ticket(options) {
      const AirService = airServiceInternal(auth, debug, production);
      return AirService.importPNR(options).then((data) => {
        const ticketParams = Object.assign({}, options, {
          ReservationLocator: data[0].uapi_reservation_locator,
        });
        return AirService.ticket(ticketParams)
          .then(result => result, (err) => {
            if (err instanceof AirRuntimeError.TicketingFoidRequired) {
              return AirService.importPNR(options)
                .then(booking => AirService.foid(booking[0]))
                .then(() => AirService.ticket(ticketParams));
            }
            return Promise.reject(err);
          });
      });
    },
  };
};
