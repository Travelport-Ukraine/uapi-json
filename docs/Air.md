# Air :airplane:

The Air workflow allows you to do what most travel agents did in the past and what many search engines still do today: book a trip for a customer. Air service provides:

* Air Shop: Search for flight options by lowest fare (LowFareSearch(Asynch)Req) or availability (AirAvailability).
* Air Price: Price the selected flights and request additional information about rules, flight details, and seating.
* Air Book: Book the flights when you are satisfied with the times, price, and rules.

# API

**AirService**
* [.shop(params)](#shop)
* [.book(params)](#book)
* [.ticket(params)](#ticket)
* [.toQueue(params)](#toQueue)
* [.importPNR(params)](#importPNR)
* [.flightInfo(params)](#flightInfo)
* [.getPNRByTicketNumber(params)](#getPNRByTicketNumber)
* [.getTicket(params)](#getTicket)
* [.getTickets(params)](#getTickets)
* [.cancelTicket(params)](#cancelTicket)
* [.cancelPNR(params)](#cancelPNR)

## .shop(params)
<a name="shop"></a>
Low Fare Shop functionality combines air availability and a fare quote request to return the lowest available fares for a specified itinerary, using origin/destination and date information. Fares are available for one-way, round-trip, and multi-city travel. Low Fare Shop does not require a booked itinerary to return fare data.

**Returns**: `Promise`
**See**: [Low Fare Shopping Model](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Models/Low_Fare_Shopping_Model.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CLow%2520Fare%2520Shopping%7C_____1)


| Param | Type | Description |
| --- | --- | --- |
| legs | `Array<Leg>` | See `Leg` description [below](#leg). |
| passengers | `Search Passengers` | See `Search Passengers` description [below](#passengers). |
| cabins | `Cabins array` | See `Cabins array` description [below](#cabins). |
| requestId | `string` | Trace id of this request. |

### Leg object
<a name="leg"></a>
Each leg represents one part of the journey. For example, a typical roundtrip IEV-PAR-IEV should have two legs: IEV-PAR and PAR-IEV. An open-jaw route would still consist of two legs, e.g. IEV-PAR, AMS-IEV. For a more complicated route, more than two legs can be requested.

| Param | Type | Description |
| --- | --- | --- |
| from | `String` | IATA code. |
| to | `String` | IATA code. |
| departureDate | `String` | Date in format `YYYY-MM-DD`. |

### Search Passengers object
<a name="passengers"></a>

| Param | Type | Description |
| --- | --- | --- |
| ADT | `Number` | Adults count. |
| INF | `Number` | Infants count ( < 2 years ) . |
| CNN | `Number` | Children count ( < 12 years ). |
| [Other types](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Shared_Air_Topics/Passenger_Type_Codes.htm) | `Number` | Other IATA Passenger Type Codes available  (see uAPI documentation). |

### Cabins array
<a name="cabins"></a>
The cabins array lists requested cabin types, currently `Economy` or `Business` or both.


**See: <a href="../examples/Air/shop.js">Shop example</a>**


## .book(params)
<a name="book"></a>
After searching for air segments and fares, air bookings are created using the results from an Air Pricing response. Book is aggregated function which do AirPrice request before making booking request. So you don't need to make AirPrice request manually.

**Returns**: `Promise`
**See**: [Create Air Booking](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Booking/Create_Air_Booking/Creating_Air_Bookings.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CAir%2520Booking%7CCreating%2520Air%2520Bookings%7C_____0)

| Param | Type | Description |
| --- | --- | --- |
| segments | `Array<Segment>` | See `Segment` description [below](#segment). |
| passengers | `Book Passengers` | See `Book Passengers` description [below](#book-passengers). |
| phone | `Phone`  | Booking agency/traveller phone. See `Phone` description [below](#phone). |
| deliveryInformation | `Delivery Information` | Optional param. See `Delivery Information` description [below](#delivery-info). |
| rule | `String` | Custom check rule. |

### Segment object
<a name="segment"></a>
Each search response has `Directions` array which represents different variations of the same trip (with same price), but with the different flight options. Each index of `Directions` array represents leg index. For example if you have IEV-PAR-IEV roundtrip search request it will have IEV-PAR, PAR-IEV legs. And `Directions` array will have length 2. Under `Directions[0]` and `Directions[1]` will be different options for the flight.
So under `Directions[0][1]` you will find `Segments` array. This segments are used for booking.
Please specify `transfer` field to mark connection segment.

`Segment` object sample.
```json
{
  "from": "KBP",
  "to": "AMS",
  "bookingClass": "G",
  "departure": "2016-11-10T19:40:00.000+02:00",
  "arrival": "2016-11-10T21:45:00.000+01:00",
  "airline": "KL",
  "flightNumber": "3098",
  "serviceClass": "Economy",
  "plane": "E90",
  "fareBasisCode": "GSRUA",
  "group": 0
}
```

### Book Passengers object
<a name="book-passengers"></a>

| Param | Type | Description |
| --- | --- | --- |
| lastName | `String` | Passenger last name. |
| firstName | `String` | Passenger first name. |
| birthDate | `String` | Birth date in format `YYYY-MM-DD`. |
| gender | `String` | One of `['M', 'F']`. |
| ageCategory | `String` | One of `['ADT', 'CNN', 'INF']`. Or [other types](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Shared_Air_Topics/Passenger_Type_Codes.htm) |
| passNumber| `String` | Pass number. |
| passCountry| `String` | 2-letter code of country. |

### Phone object
<a name="phone"></a>

| Param | Type | Description |
| --- | --- | --- |
| location | `String` | City code of the phone number origin. |
| countryCode | `String` | Country code, prepending telephone number. |
| number | `String` | Phone number. |

### Delivery info object
<a name="delivery-info"></a>

| Param | Type | Description |
| --- | --- | --- |
| name | `String` | First and last name of the delivery recipient |
| street | `String` | Street address |
| zip | `String` | Postal code |
| country | `String` | Country |
| city | `String` | City |

**See: <a href="../examples/Air/book.js">Book example</a>**


## .ticket(params)
<a name="ticket"></a>
**This library is designed to do `ImportPNR` right after ticketing is finished with success.**
Ticketing is typically included as a follow-on request to an Air Booking response.
Any number of tickets can be issued from one Stored Fare Quote when a booking has multiple passengers. Tickets can also be issued when there is more than one Stored Fare Quote in the PNR.
Ticketing function returns `true` if the process is finished with success or `Error`.
**Returns**: `Promise(true | Error)`.
**See**: [Air Ticketing](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Ticketing/Air_Ticketing.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CAir%2520Ticketing%2520(Document%2520Production)%7C_____0)

| Param | Type | Description |
| --- | --- | --- |
| comission | `Object{amount|percent}` | If amount is passed than it should be provided with currency. Ex: `{ comission: { amount: 'UAH10' }}`. If percent - it should be string with float number |
| fop | `Form Of Payment` | See `Form Of Payment` description [below](#fop). |
| pnr | `String` | 1G PNR. |


### Form of payment
<a name="fop"></a>
**Warning:** Currently only `Cash` FOP is supported.

| Param | Type | Description |
| --- | --- | --- |
| type | `String` | Form of payment type. See [docs](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Booking/Create_Air_Booking/Air_Booking_with_Form_of_Payment_(FOP).htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CAir%2520Booking%7CCreating%2520Air%2520Bookings%7CAir%2520Booking%2520Modifiers%7C_____4) |


**See: <a href="../examples/Air/ticket.js">Ticketing example</a>**


## .toQueue(params)
<a name="toQueue"></a>

The Queue Place functionality adds a specific booking (PNR) to a queue in the provider system for a specific Pseudo City Code. If a Universal Record (UR) does not exist for the PNR, it is placed in the queue anyway, but PNR Import is not completed for the UR database.

**Returns**: `Promise(true | Error)`.
**See**: [Queue managment](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Queues/queue_management.htm%3FTocPath%3DUniversal%2520Records%2520and%2520Bookings%7CQueue%2520Management%7C_____0)

| Param | Type | Description |
| --- | --- | --- |
| pcc| `String` | PCC to place booking. |
| queue | `String` | Queue number to place booking. |
| pnr | `String` | 1G PNR. |

**See: <a href="../examples/Air/queue.js">Queue example</a>**


## .importPNR(params)
<a name="importPNR"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

If the Universal Record locator code is known, a Universal Record can be retrieved by using the Universal Record Retrieve request. Whenever possible, any PNR data stored in the Universal Record is validated against the PNR data in the provider's system.

If the PNR contains no active segments it could not be imported into uAPI. Thus we are adding `OPEN` segment to he PNR,
using `TerminalService`, importing PNR and then removing created segment.

**Returns**: `Promise`. - All Information for requested PNR.
**See**: [Importing PNR](https://support.travelport.com/webhelp/uapi/uAPI.htm#Booking/UniversalRecord/Importing_PNRs.htm)

| Param | Type | Description |
| --- | --- | --- |
| pnr | `String` | 1G PNR. |

**See: <a href="../examples/Air/import.js">Import example</a>**


## .flightInfo(params)
<a name="flightInfo"></a>
Request for the flight information.

**Returns**: `Promise`
**See**: [Flight Information](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Flight_Information/Flight_Information.htm)

| Param | Type | Description |
| --- | --- | --- |
| airline | `string` | The marketing carrier for the segment. |
| departure | `string` | The departure date; either the current date or a date in the future, not include the time zone which is derived from the origin location. |
| flightNumber | `string` | The flight number for the segment |

**See: <a href="../examples/Air/flightInfo1.js">FlightInfo basic example</a>**, **<a href="../examples/Air/flightInfo2.js">FlightInfo multiple items example</a>**

## .getPNRByTicketNumber(params)
<a name="getPNRByTicketNumber"></a>
> Requires Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Request for the ticket information.

**Returns**: `Promise`, which is fullfilled with PNR as `String`

This function executes terminal command to get PNR from `*TE` command response.

| Param | Type | Description |
| --- | --- | --- |
| ticketNumber | `String` | The number of the ticket. |

**See: <a href="../examples/Air/getPNRByTicketNumber.js">getPNRByTicketNumber example</a>**

## .getTicket(params)
<a name="getTicket"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Request for the ticket information.

**Returns**: `Promise`
**See**: [Ticket Information](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Ticketing/Displaying_Ticket_Information.htm)

| Param | Type | Description |
| --- | --- | --- |
| ticketNumber | `String` | The number of the ticket. |

**See: <a href="../examples/Air/getTicket.js">getTicket example</a>**

## .getTickets(params)
<a name="getTickets"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Request for the ticket information for all tickets in PNR.

**Returns**: `Promise`
**See**: [Ticket Information](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Ticketing/Displaying_Ticket_Information.htm)

| Param | Type | Description |
| --- | --- | --- |
| pnr | `String` | 1G PNR. |

**See: <a href="../examples/Air/getTickets.js">getTickets example</a>**


## .searchBookingsByPassengerName(params)
<a name="searchBookingsByPassengerName"></a>
> Requires Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Searches for PNRs in PCC, that match provided searchPhrase. Returns single PNR or a list.

**Returns**: `Promise` with next shape `{ type: 'list' | 'pnr', data: Array | String }`

This function executes terminal command to get passengers list from `*-NAME` command response.

| Param | Type | Description |
| --- | --- | --- |
| searchPhrase | `String` | Last name to look for. |

While function returns object with type `list` it means that `Array` is returned.
Example of list response:
```
  {
    type: 'list',
    data: [
      { id: 1, firstName: 'John', lastName: 'Kovalski', pnr: 'PNR001', date, isCancelled },
      { id: 2, firstName: 'Inna', lastName: 'Kovalchuk', pnr: 'PNR002', date, isCancelled },
    ]
  }
```

When `type` equals `pnr` than data field contains pnr string.

**See: <a href="../examples/Air/searchBookingsByPassengerName.js">getPNRByTicketNumber example</a>**


## .cancelTicket(params)
<a name="cancelTicket"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Gets ticket information with [`getTicket`](#getTicket) and then tries to cancel it.

**Returns**: `Promise` which is resolved with true

| Param | Type | Description |
| --- | --- | --- |
| ticketNumber | `String` | Ticket number. |

**See: <a href="../examples/Air/cancelTicket.js">cancelTicket example</a>**

## .cancelPNR(params)
<a name="cancelPNR"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Gets pnr information and tickets list from [`importPNR`](#importPNR) and then do one of following actions:
* if PNR has tickets and all of them have status `VOID` then tries to cancel PNR
* if PNR has tickets and no `cancelTickets` flag is set, error is returned
* if PNR has tickets and `cancelTickets` flag set to `true`, checks tickets
  * if PNR has only tickets with `VOID` or `OPEN` coupons, then tickets are cancelled, then the booking is cancelled
  * if PNR contains tickets with coupons having other statuses, then error is returned

**Returns**: `Promise` which is resolved with true

| Param | Type | Description |
| --- | --- | --- |
| pnr | `String` | PNR |
| cancelTickets | `Boolean` | Defines if tickets should be cancelled or not |

**See: <a href="../examples/Air/cancelPNR.js">cancelPNR example</a>**
