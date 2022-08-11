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

    importUniversalRecordByPNR(options) {
      return service.importUniversalRecordByPNR(options);
    },

    async getUniversalRecordByPNR(options) {
      const { viewOnly = false } = options;
      try {
        return await service.getUniversalRecordByPNR({ ...options, viewOnly });
      } catch (err) {
        if (
          viewOnly === false
          && err.data
          && err.data.faultstring
          && err.data.faultstring.includes('UNEXPECTED SYSTEM ERROR | PNR(S) SYNC FAILED')
        ) {
          throw new AirRuntimeError.PNRSyncFailed(options, err);
        }

        throw err;
      }
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

    async getTicketFromTicketsList(pnr, ticketNumber) {
      const tickets = await this.getTickets({ pnr });
      return tickets.find(t => t.ticketNumber === ticketNumber);
    },

    retryableTicketErrorHandlers: {
      'AirRuntimeError.TicketInfoIncomplete': async function (ticketNumber) {
        const pnr = await this.getPNRByTicketNumber({ ticketNumber });
        return this.getTicketFromTicketsList(pnr, ticketNumber);
      },
      'AirRuntimeError.DuplicateTicketFound': async function (ticketNumber) {
        const pnr = await this.getPNRByTicketNumber({ ticketNumber });
        try {
          const ticket = await this.getTicketFromTicketsList(pnr, ticketNumber);

          if (!ticket) {
            throw new AirRuntimeError.TicketNotFound({ ticketNumber });
          }

          return ticket;
        } catch (e) {
          const { splitBookings } = await this.getBooking({ pnr });
          if (!splitBookings) {
            throw e;
          }

          const results = await Promise.all(splitBookings.map(async (splitPnr) => {
            try {
              const { uapi_ur_locator: urLocator } = await this.getBooking({ pnr: splitPnr });

              const ticket = await service.getTicket({
                ticketNumber,
                uapi_ur_locator: urLocator,
                pnr: splitPnr,
              });

              if (!ticket || ticket.ticketNumber !== ticketNumber) {
                return null;
              }

              return ticket;
            } catch (err) {
              return null;
            }
          }));

          const [ticket = null] = results.filter(result => result);
          return ticket;
        }
      },
    },

    async getTicket(options) {
      const { ticketNumber, allowNoProviderLocatorCodeRetrieval = false } = options;
      try {
        return await service.getTicket({ ticketNumber, allowNoProviderLocatorCodeRetrieval });
      } catch (err) {
        const retryableErrorHandler = this.retryableTicketErrorHandlers[err.name];
        const ticket = await (retryableErrorHandler
          && retryableErrorHandler.call(this, ticketNumber));
        if (!ticket) {
          throw err;
        }

        return ticket;
      }
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

    async getPNRByTicketNumber(options) {
      const terminal = createTerminalService(settings);
      const screen = await terminal.executeCommand(`*TE/${options.ticketNumber}`);
      const [_, pnr = null] = screen.match(/RLOC [^\s]{2} ([^\s]{6})/) || [];

      await terminal.closeSession().catch(() => null);

      if (!pnr) {
        throw new AirRuntimeError.ParseTicketPNRError({ options, screen });
      }

      return pnr;
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

    async cancelBooking(options) {
      const {
        ignoreTickets = false,
        cancelTickets = false,
        pnr,
      } = options;

      const checkTickets = tickets => Promise.all(tickets.map(
        (ticketData) => {
          // Check for VOID or REFUND
          const allTicketsVoidOrRefund = ticketData.tickets.every(
            ticket => ticket.coupons.every(
              coupon => coupon.status === 'V' || coupon.status === 'R'
            )
          );

          if (allTicketsVoidOrRefund) {
            return true;
          }

          if (cancelTickets !== true) {
            throw new AirRuntimeError.PNRHasOpenTickets({ tickets });
          }
          // Check for not OPEN/VOID segments
          const hasNotOpenSegment = ticketData.tickets.some(
            ticket => ticket.coupons.some(
              coupon => 'OV'.indexOf(coupon.status) === -1
            )
          );

          if (hasNotOpenSegment) {
            throw new AirRuntimeError.UnableToCancelTicketStatusNotOpen();
          }

          return Promise.all(
            ticketData.tickets.map(
              ticket => (
                ticket.coupons[0].status !== 'V'
                  ? service.cancelTicket({ pnr, ticketNumber: ticket.ticketNumber })
                  : Promise.resolve(true)
              )
            )
          );
        }
      ));

      try {
        if (!ignoreTickets) {
          const tickets = await this.getTickets({ pnr });
          await checkTickets(tickets);
        }

        const booking = await this.getBooking(options);
        await service.cancelBooking(booking);
        return true;
      } catch (err) {
        throw new AirRuntimeError.FailedToCancelPnr(options, err);
      }
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

    getEMDList(options) {
      return service.getEMDList(options);
    },

    getEMDItem(options) {
      return service.getEMDItem(options)
        .then((result) => {
          if (options.pnr) {
            return result;
          }

          return service.getEMDItem({ ...options, pnr: result.pnr });
        });
    },
  };
};
