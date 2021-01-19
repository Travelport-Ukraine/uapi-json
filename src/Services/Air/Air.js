const moment = require('moment');
const retry = require('promise-retry');

const { parsers } = require('../../utils');
const getBookingFromUr = require('../../utils/get-booking-from-ur');
const airService = require('./AirService');
const createTerminalService = require('../Terminal/Terminal');
const { AirRuntimeError } = require('./AirErrors');
const validateServiceSettings = require('../../utils/validate-service-settings');

module.exports = (settings) => {
  const service = airService(validateServiceSettings(settings));
  const log = (settings.options && settings.options.logFunction) || console.log;
  return {
    shop(options) {
      if (options.async === true) {
        return service.searchLowFaresAsync(options);
      }
      return service.searchLowFares(options);
    },

    retrieveShop(options) {
      return service.searchLowFaresRetrieve(options);
    },

    availability(options) {
      return service.availability(options);
    },

    airPrice(options) {
      return service.airPrice(options);
    },

    fareRules(options) {
      // add request for fare rules
      const request = {
        ...options,
        fetchFareRules: true,
      };

      return service.lookupFareRules(request);
    },

    toQueue(options) {
      return service.gdsQueue(options);
    },

    addSegments(options) {
      if (
        !options.version
        || !options.universalRecordLocatorCode
        || !options.reservationLocatorCode
      ) {
        return this.getBooking({ pnr: options.pnr })
          .then((booking) => {
            const missedOptions = {
              version: options.version || booking.version,
              reservationLocatorCode: (
                options.reservationLocatorCode || booking.uapi_reservation_locator
              ),
              universalRecordLocatorCode: (
                options.universalRecordLocatorCode || booking.uapi_ur_locator
              ),
            };

            return service.addSegments(Object.assign({}, options, missedOptions));
          });
      }

      return service.addSegments(options);
    },

    book(options) {
      return service.airPricePricingSolutionXML(options).then((data) => {
        const tauDate = moment(options.tau || null);
        const tau = tauDate.isValid() ? tauDate.format() : moment().add(3, 'hours').format();
        const bookingParams = Object.assign({}, {
          ticketDate: tau,
          ActionStatusType: 'TAU',
        }, data, options);
        return service.createReservation(bookingParams).catch((err) => {
          if (err instanceof AirRuntimeError.SegmentBookingFailed
              || err instanceof AirRuntimeError.NoValidFare) {
            if (options.allowWaitlist) { // will not have a UR if waitlisting restricted
              const code = err.data['universal:UniversalRecord'].LocatorCode;
              return service.cancelUR({
                LocatorCode: code,
              }).then(() => Promise.reject(err));
            }
            return Promise.reject(err);
          }
          return Promise.reject(err);
        });
      });
    },

    getBooking(options) {
      return this.getUniversalRecordByPNR(options)
        .then(
          ur => getBookingFromUr(ur, options.pnr)
            || Promise.reject(new AirRuntimeError.NoPNRFoundInUR(ur))
        )
        .then((data) => {
          /*
            disable tickets from PNR, because this is known bug in uapi,
            use getTickets(reservationLocatorCode) instead
           */
          const { tickets, ...otherData } = data; // eslint-disable-line no-unused-vars

          return otherData;
        });
    },

    getPNR(options) {
      console.warn('DEPRECATED, will be dropped in next major version, use getBooking');
      return this.getBooking(options);
    },

    getUniversalRecord(options) {
      return service.getUniversalRecord(options);
    },

    getUniversalRecordByPNR(options) {
      return service.getUniversalRecordByPNR(options)
        .catch((err) => {
          // Checking for error type
          if (!(err instanceof AirRuntimeError.NoReservationToImport)) {
            return Promise.reject(err);
          }
          // Creating passive segment to import PNR
          const terminal = createTerminalService(settings);
          const segment = {
            date: moment().add(42, 'days').format('DDMMM'),
            airline: 'OK',
            from: 'DOH',
            to: 'ODM',
            comment: 'NO1',
            class: 'Y',
          };
          const segmentCommand = (
            `0${segment.airline}OPEN${segment.class}${segment.date}${segment.from}${segment.to}${segment.comment}`
          ).toUpperCase();
          const segmentResult = (
            `1. ${segment.airline} OPEN ${segment.class}  ${segment.date} ${segment.from}${segment.to} ${segment.comment}`
          ).toUpperCase();
          const pnrRegExp = new RegExp(`^(?:\\*\\* THIS BF IS CURRENTLY IN USE \\*\\*\\s*)?${options.pnr}`);
          return terminal.executeCommand(`*${options.pnr}`)
            .then((response) => {
              if (!response.match(pnrRegExp)) {
                return Promise.reject(new AirRuntimeError.UnableToOpenPNRInTerminal());
              }
              return Promise.resolve();
            })
            .then(() => terminal.executeCommand(segmentCommand))
            .then((response) => {
              if (response.indexOf(segmentResult) === -1) {
                return Promise.reject(new AirRuntimeError.UnableToAddExtraSegment());
              }
              return Promise.resolve();
            })
            .then(() => {
              const ticketingDate = moment().add(10, 'days').format('DDMMM');
              const command = `T.TAU/${ticketingDate}`;
              return terminal.executeCommand(command)
                .then(() => terminal.executeCommand('R.UAPI+ER'))
                .then(() => terminal.executeCommand('ER'));
            })
            .then((response) => {
              if (
                (!response.match(pnrRegExp))
                || (response.indexOf(segmentResult) === -1)
              ) {
                return Promise.reject(new AirRuntimeError.UnableToSaveBookingWithExtraSegment());
              }
              return Promise.resolve();
            })
            .catch(
              importErr => terminal.closeSession().then(
                () => Promise.reject(
                  new AirRuntimeError.UnableToImportPnr(options, importErr)
                )
              )
            )
            .then(() => terminal.closeSession())
            .then(() => service.getUniversalRecordByPNR(options))
            .then(ur => service.cancelBooking(getBookingFromUr(ur, options.pnr)))
            .then(() => service.getUniversalRecordByPNR(options));
        });
    },

    ticket(options) {
      return this.getBooking(options)
        .then((booking) => {
          const { fareQuotes = [] } = booking;
          const currency = fareQuotes.reduce((accCurrency, fq) => {
            if (accCurrency !== null) {
              return accCurrency;
            }

            const { pricingInfos = [] } = fq;

            return pricingInfos.reduce((totalPriceCurrency, pricingInfo) => {
              if (totalPriceCurrency !== null) {
                return totalPriceCurrency;
              }

              return pricingInfo.totalPrice
                ? pricingInfo.totalPrice.slice(0, 3).trim()
                : null;
            }, null);
          }, null);

          if (!currency || !/[A-Z]{3}/i.test(currency)) {
            return Promise.reject(new AirRuntimeError.CouldNotRetrieveCurrency(options));
          }

          return {
            ReservationLocator: booking.uapi_reservation_locator,
            currency,
          };
        })
        .then(({ ReservationLocator, currency }) => retry({ retries: 3 }, (again, number) => {
          if (settings.debug && number > 1) {
            log(`ticket ${options.pnr} issue attempt number ${number}`);
          }

          return service.ticket({
            ...options,
            ReservationLocator,
            currency
          })
            .catch((err) => {
              if (err instanceof AirRuntimeError.TicketingFoidRequired) {
                return this.getBooking(options)
                  .then(updatedBooking => service.foid(updatedBooking))
                  .then(() => again(err));
              }
              if (err instanceof AirRuntimeError.TicketingPNRBusy) {
                return again(err);
              }
              return Promise.reject(err);
            });
        }));
    },

    flightInfo(options) {
      const parameters = {
        flightInfoCriteria: Array.isArray(options) ? options : [options],
      };
      return service.flightInfo(parameters);
    },

    getTicket(options) {
      return service.getTicket(options)
        .catch((err) => {
          if (!(err instanceof AirRuntimeError.TicketInfoIncomplete)
            && !(err instanceof AirRuntimeError.DuplicateTicketFound)) {
            return Promise.reject(err);
          }
          return this.getPNRByTicketNumber({
            ticketNumber: options.ticketNumber,
          })
            .then(pnr => this.getBooking({ pnr }))
            .then(booking => service.getTicket({
              ...options,
              pnr: booking.pnr,
              uapi_ur_locator: booking.uapi_ur_locator,
            }));
        });
    },

    async getTickets(options) {
      const { pnr } = options;
      const ur = await this.getUniversalRecordByPNR({ pnr });
      const urData = Array.isArray(ur) ? ur[0] : ur;
      const { uapi_reservation_locator: reservationLocatorCode } = urData;
      try {
        return await service.getTickets({ reservationLocatorCode });
      } catch (err) {
        if (err instanceof AirRuntimeError.NoAgreement) {
          throw err;
        }

        throw new AirRuntimeError.UnableToRetrieveTickets(options, err);
      }
    },

    getBookingByTicketNumber(options) {
      const terminal = createTerminalService(settings);
      return terminal.executeCommand(`*TE/${options.ticketNumber}`)
        .then(
          response => terminal.closeSession()
            .then(() => response.match(/RLOC [^\s]{2} ([^\s]{6})/)[1])
            .catch(() => Promise.reject(new AirRuntimeError.PnrParseError(response)))
        )
        .catch(
          err => Promise.reject(new AirRuntimeError.GetPnrError(options, err))
        );
    },

    getPNRByTicketNumber(options) {
      console.warn('DEPRECATED, will be dropped in next major version, use getBookingByTicketNumber');
      return this.getBookingByTicketNumber(options);
    },

    searchBookingsByPassengerName(options) {
      const terminal = createTerminalService(settings);
      return terminal.executeCommand(`*-${options.searchPhrase}`)
        .then((firstScreen) => {
          const list = parsers.searchPassengersList(firstScreen);
          if (list) {
            return Promise
              .all(list.map((line) => {
                const localTerminal = createTerminalService(settings);
                return localTerminal
                  .executeCommand(`*-${options.searchPhrase}`)
                  .then((firstScreenAgain) => {
                    if (firstScreenAgain !== firstScreen) {
                      return Promise.reject(
                        new AirRuntimeError.RequestInconsistency({
                          firstScreen,
                          firstScreenAgain,
                        })
                      );
                    }

                    return localTerminal.executeCommand(`*${line.id}`);
                  })
                  .then(parsers.bookingPnr)
                  .then((pnr) => {
                    return localTerminal.closeSession()
                      .then(() => ({ ...line, pnr }));
                  });
              }))
              .then(data => ({ type: 'list', data }));
          }

          const pnr = parsers.bookingPnr(firstScreen);
          if (pnr) {
            return {
              type: 'pnr',
              data: pnr,
            };
          }

          return Promise.reject(
            new AirRuntimeError.MissingPaxListAndBooking(firstScreen)
          );
        })
        .then(results => terminal.closeSession()
          .then(() => results)
          .catch(() => results));
    },

    cancelTicket(options) {
      return this.getTicket(options)
        .then(
          ticketData => service.cancelTicket({
            pnr: ticketData.pnr,
            ticketNumber: options.ticketNumber,
          })
        )
        .catch(
          err => Promise.reject(new AirRuntimeError.FailedToCancelTicket(options, err))
        );
    },

    cancelBooking(options) {
      const ignoreTickets = typeof options.ignoreTickets === 'undefined'
        ? false // default value
        : options.ignoreTickets;

      const checkTickets = (tickets) => {
        return Promise.all(tickets.map(
          (ticketData) => {
            // Check for VOID or REFUND
            const allTicketsVoidOrRefund = ticketData.tickets.every(
              ticket => ticket.coupons.every(
                coupon => coupon.status === 'V' || coupon.status === 'R'
              )
            );
            if (allTicketsVoidOrRefund) {
              return Promise.resolve(true);
            }
            // Check for cancelTicket option
            if (options.cancelTickets !== true) {
              return Promise.reject(new AirRuntimeError.PNRHasOpenTickets());
            }
            // Check for not OPEN/VOID segments
            const hasNotOpenSegment = ticketData.tickets.some(
              ticket => ticket.coupons.some(
                coupon => 'OV'.indexOf(coupon.status) === -1
              )
            );
            if (hasNotOpenSegment) {
              return Promise.reject(new AirRuntimeError.UnableToCancelTicketStatusNotOpen());
            }
            return Promise.all(
              ticketData.tickets.map(
                ticket => (
                  ticket.coupons[0].status !== 'V'
                    ? service.cancelTicket({
                      pnr: options.pnr,
                      ticketNumber: ticket.ticketNumber,
                    })
                    : Promise.resolve(true)
                )
              )
            );
          }
        ));
      };

      return this.getUniversalRecordByPNR(options)
        .then((ur) => {
          const urr = Array.isArray(ur) ? ur[0] : ur;
          const record = {
            reservationLocatorCode: urr.uapi_reservation_locator
          };
          return (ignoreTickets
            ? Promise.resolve([])
            : this.getTickets(record).then(checkTickets)
          )
            .then(() => this.getBooking(options))
            .then(booking => service.cancelBooking(booking))
            .catch(
              err => Promise.reject(new AirRuntimeError.FailedToCancelPnr(options, err))
            );
        });
    },

    cancelPNR(options) {
      console.warn('DEPRECATED, will be dropped in next major version, use cancelBooking');
      return this.cancelBooking(options);
    },

    getExchangeInformation(options) {
      return this.getBooking(options)
        .then(booking => service.exchangeQuote({
          ...options,
          bookingDate: moment(booking.createdAt).format('YYYY-MM-DD'),
        }));
    },

    exchangeBooking(options) {
      return this.getBooking(options)
        .then(booking => service.exchangeBooking({
          ...options,
          uapi_reservation_locator: booking.uapi_reservation_locator,
        }));
    },
  };
};
