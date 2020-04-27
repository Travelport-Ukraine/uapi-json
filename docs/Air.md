# Air :airplane:

The Air workflow allows you to do what most travel agents did in the past and what many search engines still do today: book a trip for a customer. Air service provides:

* Air Shop: Search for flight options by lowest fare (LowFareSearch(Asynch)Req) or availability (AirAvailability).
* Air Price: Price the selected flights and request additional information about rules, flight details, and seating.
* Air Book: Book the flights when you are satisfied with the times, price, and rules.

# API

**AirService**
* [.shop(params)](#shop)
* [.retrieveShop(params)](#retrieve-shop)
* [.availability(params)](#shop) (same params as `.shop(params)`)
* [.fareRules(params)](#fareRules)
* [.book(params)](#book)
* [.ticket(params)](#ticket)
* [.toQueue(params)](#toQueue)
* [.getBooking(params)](#getBooking)
* [.getUniversalRecordByPNR(params)](#getUniversalRecordByPNR)
* [.getUniversalRecord(params)](#getUniversalRecord)
* [.flightInfo(params)](#flightInfo)
* [.getBookingByTicketNumber(params)](#getBookingByTicketNumber)
* [.searchBookingsByPassengerName(params)](#searchBookingsByPassengerName)
* [.getTicket(params)](#getTicket)
* [.getTickets(params)](#getTickets)
* [.cancelTicket(params)](#cancelTicket)
* [.cancelBooking(params)](#cancelBooking)
* [.addSegments(params)](#addSegments)

## .shop(params)
<a name="shop"></a>
Low Fare Shop functionality combines air availability and a fare quote request to return the lowest available fares for a specified itinerary, using origin/destination and date information. Fares are available for one-way, round-trip, and multi-city travel. Low Fare Shop does not require a booked itinerary to return fare data.

**Returns**: `Promise`
**See**: [Low Fare Shopping Model](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Models/Low_Fare_Shopping_Model.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CLow%2520Fare%2520Shopping%7C_____1)


| Param | Type | Description |
| --- | --- | --- |
| legs | `Array<Leg>` | See `Leg` description [below](#leg). |
| passengers | `Search Passengers` | See `Search Passengers` description [below](#passengers). |
| pricing | `Pricing` | See `Pricing` modifiers description [below](#pricing_mod). <i>Optional.</i> |
| cabins | `Array<Cabin>` | See `Cabins array` description [below](#cabins). |
| requestId | `string` | Trace id of this request. <i>Optional.</i> |
| maxJourneyTime | `number` | Maximum travel time in hours 0-99. Total for all legs <i>Optional.</i> |
| solutionResult | `Boolean` | Set true to retrieve [AirPricingSolution](https://support.travelport.com/webhelp/uapi/Content/Air/Low_Fare_Shopping/Low_Fare_Shopping_(Synchronous).htm#AirPricingSolutions), default is False (retrieves [AirPricePoint](https://support.travelport.com/webhelp/uapi/Content/Air/Low_Fare_Shopping/Low_Fare_Shopping_by_Price_Points.htm). <i>Optional.</i> |.
| maxSolutions | `number` | Maximum number of solutions. <i>Optional.</i> |.
| carriers | `Array<String>` | Array of carriers' codes. <i>Optional.</i> |
| preferredConnectionPoints | `Array<String>` | Array of IATA codes. <i>Optional.</i> |
| prohibitedConnectionPoints | `Array<String>` | Array of IATA codes. <i>Optional.</i> |
| permittedConnectionPoints | `Array<String>` | Array of IATA codes. <i>Optional.</i> |
| async | `Boolean` | Use this flag to use LowFareSearchAsynch. Default value is `false`.<i>Optional.</i> See [Low Fare Shopping (Asynchronous)](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Low_Fare_Shopping/Low_Fare_Shopping_(Asynchronous).htm)|
| faresOnly | `Boolean` | Use this flag to retrieve traceId, searchId, hasMoreResult with the fare data. Default value is `false`. <i>Optional.</i> |

### Pricing object
<a name="pricing_mod"></a>

| Param | Type | Description |
| --- | --- | --- |
| currency | `String` | Currency to convert results prices. |
| eTicketability | `Boolean` | Detect if pricing solution will be ticketable as e-ticket. |


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

## .retrieveShop(params)
<a name="retrieve-shop"></a>
If Low Fare Shop Async request has more results in cache, use this method to retrieve remaining results. This method should return the data in a format similar to a standard shop() results.

**Returns**: `Promise`
**See**: [Retrieving Low Fare Search Data](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Low_Fare_Shopping/Retrieving_Low_Fare_Search_Data.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CLow%2520Fare%2520Shopping%7CLow%2520Fare%2520Shopping%2520(Asynchronous)%7C_____1)

## .fareRules(params)
<a name="fareRules"></a>
For fetching detailed fare rules after itinerary selection this method is used.

**Returns**: `Promise`
**See**: [Fare Rules](https://support.travelport.com/webhelp/uapi/Content/Air/Fare_Rules/Fare_Rules.htm)
| Param | Type | Description |
| --- | --- | --- |
| segments | `Array<Segment>` | See `Segment` description [below](#segment). |
| passengers | `Book Passengers` | See `Book Passengers` description [below](#book-passengers). |
| long | `boolean`  | true to fetch long explanations, false to fetch short ones. |
| requestId | `String` | Unique ID to identify request and response in profiler logs |

**See: <a href="../examples/Air/fareRules.js">farerules example</a>**

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
| rule | `String` | Custom check rule. |
| allowWaitlist | `Boolean` | Allow open waitlisted segments, do not cancel booking. See `allowWaitlist` description [below](#allow-waitlist). |
| deliveryInformation | `Delivery Information` | Optional. See `Delivery Information` description [below](#delivery-info). |
| tau | `String`/`Date`/`Array<Number>` | Optional. Takes  See `TAU` description [below](#tau). The default value is 3 hours from the current timestamp.|
| platingCarrier | `String` | Optional. PlatingCarrier. |

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
| title | `String` | One of `['MR', 'MS', 'MSTR', 'MISS']`. |
| birthDate | `String` | Birth date in format `YYYY-MM-DD`. |
| gender | `String` | One of `['M', 'F']`. |
| ageCategory | `String` | One of `['ADT', 'CNN', 'INF']`. Or [other types](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Shared_Air_Topics/Passenger_Type_Codes.htm) |
| passNumber| `String` | Pass number. |
| passCountry| `String` | 2-letter code of country. |
| ssr | `Array<SSR>` | Optional. SSR requests. See `SSR` description [below](#ssr).. |

### SSR object
<a name="ssr"></a>

| Param | Type | Description |
| --- | --- | --- |
| type | `String` | SSR Type code eg. `CHLD, CTCR, DOCS, DOCA, FOID`. |
| carrier | `String` | Optional. 2-letter IATA Code of airline, default is `YY` |
| status | `String` | Optional. Status eg. `NN, PN, UN, HK` |
| freeText | `String` | SSR FreeText |

### Phone object
<a name="phone"></a>

| Param | Type | Description |
| --- | --- | --- |
| location | `String` | City code of the phone number origin. |
| countryCode | `String` | Country code, prepending telephone number. |
| number | `String` | Phone number. |

### allowWaitlist
<a name="allow-waitlist"></a>

Default behavior is to cancel the entire Universal Record when part of the booking has failed.
This includes both open and closed waitlisting and other errors.
With `allowWaitlist`=true the UR is canceled only for a closed wait list, but open waitlist reservation is kept and returned to user.

### Delivery info object
<a name="delivery-info"></a>

| Param | Type | Description |
| --- | --- | --- |
| name | `String` | First and last name of the delivery recipient |
| street | `String` | Street address |
| zip | `String` | Postal code |
| country | `String` | Country |
| city | `String` | City |

### TAU - Ticketing Arrangement
<a name="tau"></a>
Ticketing Arrangement is an optional param used for domestic purposes of agents to specify assumed date/time of booking.

The default value is 3 hours from the current timestamp.

The `tau` option  represents an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format, Date object or Array of numbers.

To see the list of all available formats, please use the following [documentation](http://momentjs.com/docs/#/parsing/).

**See: <a href="../examples/Air/book.js">Book example</a>**


## .ticket(params)
<a name="ticket"></a>
**This library is designed to do `getBooking` right after ticketing is finished with success.**
Ticketing is typically included as a follow-on request to an Air Booking response.
Any number of tickets can be issued from one Stored Fare Quote when a booking has multiple passengers. Tickets can also be issued when there is more than one Stored Fare Quote in the PNR.
Ticketing function returns `true` if the process is finished with success or `Error`.
**Returns**: `Promise(true | Error)`.
**See**: [Air Ticketing](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Ticketing/Air_Ticketing.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CAir%2520Ticketing%2520(Document%2520Production)%7C_____0)

| Param | Type | Description |
| --- | --- | --- |
| commission | <code>Object{amount&#124;percent}</code> | If amount is passed than it should be provided with currency. Ex: `{ comission: { amount: 'UAH10' }}`. If percent - it should be string with float number |
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

## .getUniversalRecordByPNR(params)
<a name="getUniversalRecordByPNR"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

This method returns an array of all PNR objects, which are contained in Universal record, holding the PNR provided. If Universal record does not exists it is being created and PNR is imported into created Universal record.

If the PNR contains no active segments it could not be imported into uAPI. Thus library tries to add `OPEN` segment to he PNR, using [`TerminalService`](Terminal.md), importing PNR and then removing created segment.

**Returns**: `Promise`. - All Information for requested PNR.
**See**: [Importing PNR](https://support.travelport.com/webhelp/uapi/uAPI.htm#Booking/UniversalRecord/Importing_PNRs.htm)

| Param | Type | Description |
| --- | --- | --- |
| pnr | `String` | 1G PNR. |

**See: <a href="../examples/Air/getUniversalRecordByPNR.js">Example</a>**

## .getUniversalRecord(params)
<a name="getUniversalRecord"></a>

This method returns an array of all PNR objects, which are contained in Universal record, holding the PNR provided. If Universal record does not exists RuntimeError.AirRuntimeError "Record locator not found" will be raised.

**Returns**: `Promise`. - All Information for requested Universal Record.
**See**: [Retrieving a Universal Record with a Known Locator](https://support.travelport.com/webhelp/uapi/uAPI.htm#Booking/Retrieve/Retrieving_Universal_Records.htm)

| Param | Type | Description |
| --- | --- | --- |
| universalRecordLocatorCode | `String` | uAPI Record Locator Code |

**See: <a href="../examples/Air/getUniversalRecord.js">Example</a>**

## .getBooking(params)
<a name="getBooking"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

This method executes [`getUniversalRecordByPNR`](#getUniversalRecordByPNR) and then returns single PNR object from its output.

**Returns**: `Promise`. - All Information for requested PNR.
**See**: [Importing PNR](https://support.travelport.com/webhelp/uapi/uAPI.htm#Booking/UniversalRecord/Importing_PNRs.htm)

| Param | Type | Description |
| --- | --- | --- |
| pnr | `String` | 1G PNR. |

**See: <a href="../examples/Air/getBooking.js">getBooking example</a>**

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

## .getBookingByTicketNumber(params)
<a name="getBookingByTicketNumber"></a>
> Requires Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Request for the ticket information.

**Returns**: `Promise`, which is fullfilled with PNR as `String`

This function executes terminal command to get PNR from `*TE` command response.

| Param | Type | Description |
| --- | --- | --- |
| ticketNumber | `String` | The number of the ticket. |

**See: <a href="../examples/Air/getBookingByTicketNumber.js">getBookingByTicketNumber example</a>**

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
| reservationLocatorCode | `String` | uAPI reservation code. |

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

**See: <a href="../examples/Air/searchBookingsByPassengerName.js">getBookingByTicketNumber example</a>**


## .cancelTicket(params)
<a name="cancelTicket"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Gets ticket information with [`getTicket`](#getTicket) and then tries to cancel it.

**Returns**: `Promise` which is resolved with true

| Param | Type | Description |
| --- | --- | --- |
| ticketNumber | `String` | Ticket number. |

**See: <a href="../examples/Air/cancelTicket.js">cancelTicket example</a>**

## .cancelBooking(params)
<a name="cancelBooking"></a>
> May require Terminal access enabled in uAPI. See [TerminalService](Terminal.md)

Gets pnr information and tickets list from [`importPNR`](#importPNR) and then do one of following actions:
* if PNR has tickets and all of them have status `VOID`, `REFUND` or both of them, then tries to cancel PNR
* if PNR has tickets and no `cancelTickets` flag is set, error is returned
* if PNR has tickets and `cancelTickets` flag set to `true`, checks tickets
  * if PNR has only tickets with `VOID` or `OPEN` coupons, then tickets are cancelled, then the booking is cancelled
  * if PNR contains tickets with coupons having other statuses, then error is returned
* if `ignoreTickets` flag set to `true`, all tickets in PNR will be ignored, regardless of their status and `cancelTickets` flag

**Returns**: `Promise` which is resolved with true

| Param | Type | Description |
| --- | --- | --- |
| pnr | `String` | PNR |
| cancelTickets | `Boolean` | Defines if tickets should be cancelled or not |
| ignoreTickets | `Boolean` | Defines if tickets should be ignored. The default value is `false` |

**See: <a href="../examples/Air/cancelBooking.js">cancelBooking example</a>**

## .addSegments(params)
<a name="addSegments"></a>

Add segments to an existing reservation record.

**Returns**: `Promise` which is resolved with response message.

| Param | Type | Description |
| --- | --- | --- |
| pnr | `String` | PNR |
| segments | `Array` | Segments required to add |
| version | `Number` | Optional. Current uAPI record version |
| universalRecordLocatorCode | `String` | Optional. uAPI universal locator code |
| reservationLocatorCode | `String` | Optional. uAPI reservation locator code |

It is recommended to pass `version` param in order to ensure that the last version of the PNR was reviewed before modification.
