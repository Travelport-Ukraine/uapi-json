# Air :airplane:

The Air workflow allows you to do what most travel agents did in the past and what many search engines still do today: book a trip for a customer. Air service provides:

* Air Shop: Search for flight options by lowest fare (LowFareSearch(Asynch)Req) or availability (AirAvailability).
* Air Price: Price the selected flights and request additional information about rules, flight details, and seating.
* Air Book: Book the flights when you are satisfied with the times, price, and rules.

# API

* **AirService**
    * [.shop(params)](#shop) ⇒ <code>Promise</code>
    * [.book(params)](#book) ⇒ <code>Promise</code>
    * [.ticket(params)](#ticket) ⇒ <code>Promise</code>
    * .void(params) ⇒ <code>Promise</code>
    * [.toQueue(params)](#toQueue) ⇒ <code>Promise</code>
    * [.importPNR(params)](#importPNR) ⇒ <code>Promise</code>
    * [flightInfo(params)](#flightInfo) ⇒ <code>Promise</code>

<a name="shop"></a>
### .shop(params)
Low Fare Shop functionality combines air availability and a fare quote request to return the lowest available fares for a specified itinerary, using origin/destination and date information. Fares are available for one-way, round-trip, and multi-city travel. Low Fare Shop does not require a booked itinerary to return fare data.

**Returns**: <code>Promise</code>
**See**: [Low Fare Shopping Model](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Models/Low_Fare_Shopping_Model.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CLow%2520Fare%2520Shopping%7C_____1)


| Param | Type | Description |
| --- | --- | --- |
| legs | <code>Array\<Leg\></code> | See `Leg` description [below](#leg). |
| passengers | <code>Search Passengers</code> | See `Search Passengers` description [below](#passengers). |
| cabins | <code>Cabins array</code> | See `Cabins array` description [below](#cabins). |
| requestId | <code>string</code> | Trace id of this request. |

<a name="leg"></a>
#### Leg object

Each leg represents one part of the journey. For example, a typical roundtrip IEV-PAR-IEV should have two legs: IEV-PAR and PAR-IEV. An open-jaw route would still consist of two legs, e.g. IEV-PAR, AMS-IEV. For a more complicated route, more than two legs can be requested.

| Param | Type | Description |
| --- | --- | --- |
| from | <code>String</code> | IATA code. |
| to | <code>String</code> | IATA code. |
| departureDate | <code>String</code> | Date in format `YYYY-MM-DD`. |

<a name="passengers"></a>
#### Search Passengers object

| Param | Type | Description |
| --- | --- | --- |
| ADT | <code>Number</code> | Adults count. |
| INF | <code>Number</code> | Infants count ( < 2 years ) . |
| CNN | <code>Number</code> | Children count ( < 12 years ). |
| [Other types](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Shared_Air_Topics/Passenger_Type_Codes.htm) | <code>Number</code> | Other IATA Passenger Type Codes available  (see uAPI documentation). |

<a name="cabins"></a>
#### Cabins array
The cabins array lists requested cabin types, currently `Economy` or `Business` or both.


**See: <a href="../examples/Air/shop.js">Shop example</a>**



<a name="book"></a>
### .book(params)
After searching for air segments and fares, air bookings are created using the results from an Air Pricing response. Book is aggregated function which do AirPrice request before making booking request. So you don't need to make AirPrice request manually.

**Returns**: <code>Promise</code>
**See**: [Create Air Booking](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Booking/Create_Air_Booking/Creating_Air_Bookings.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CAir%2520Booking%7CCreating%2520Air%2520Bookings%7C_____0)


| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array\<Segment\></code> | See `Segment` description [below](#segment). |
| passengers | <code>Book passengers</code> | See `Book Passengers` description [below](#book-passengers). |
| rule | <code>String</code> | Custom check rule. |

<a name="segment"></a>
#### Segment object

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
    "transfer": false
}
```

<a name="book-passengers"></a>
#### Book Passengers object

| Param | Type | Description |
| --- | --- | --- |
| lastName | <code>String</code> | Passenger last name. |
| firstName | <code>String</code> | Passenger first name. |
| birthDate | <code>String</code> | Birth date in format `YYYYMMDD`. |
| gender | <code>String</code> | One of `['M', 'F']`. |
| ageCategory | <code>String</code> | One of `['ADT', 'CNN', 'INF']`. Or [other types](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Shared_Air_Topics/Passenger_Type_Codes.htm) |
| passNumber| <code>String</code> | Pass number. |
| passCountry| <code>String</code> | 2-letter code of country. |

**See: <a href="../examples/Air/book.js">Book example</a>**


<a name="ticket"></a>
### .ticket(params)
**This library is designed to do `ImportPNR` right after ticketing is finished with success.**
Ticketing is typically included as a follow-on request to an Air Booking response.
Any number of tickets can be issued from one Stored Fare Quote when a booking has multiple passengers. Tickets can also be issued when there is more than one Stored Fare Quote in the PNR.
Ticketing function returns `true` if the process is finished with success or `Error`.
**Returns**: <code>Promise(true | Error)</code>.
**See**: [Air Ticketing](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Ticketing/Air_Ticketing.htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CAir%2520Ticketing%2520(Document%2520Production)%7C_____0)


| Param | Type | Description |
| --- | --- | --- |
| comission | <code>Object{amount\| percent}</code> | If amount is passed than it should be provided with currency. Ex: `{ comission: { amount: 'UAH10' }}`. If percent - it should be string with float number |
| fop | <code>Form Of Payment</code> | See `Form Of Payment` description [below](#fop). |
| pnr | <code>String</code> | 1G PNR. |


<a name="fop"></a>
#### Form of payment
**Warning:** Currently only `Cash` FOP is supported.

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | Form of payment type. See [docs](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Air_Booking/Create_Air_Booking/Air_Booking_with_Form_of_Payment_(FOP).htm%3FTocPath%3DAir%7CAir%2520Shopping%2520and%2520Booking%7CAir%2520Booking%7CCreating%2520Air%2520Bookings%7CAir%2520Booking%2520Modifiers%7C_____4) |


**See: <a href="../examples/Air/ticket.js">Ticketing example</a>**



<a name="toQueue"></a>
### .toQueue(params)

The Queue Place functionality adds a specific booking (PNR) to a queue in the provider system for a specific Pseudo City Code. If a Universal Record (UR) does not exist for the PNR, it is placed in the queue anyway, but PNR Import is not completed for the UR database.

**Returns**: <code>Promise(true | Error)</code>.
**See**: [Queue managment](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Queues/queue_management.htm%3FTocPath%3DUniversal%2520Records%2520and%2520Bookings%7CQueue%2520Management%7C_____0)


| Param | Type | Description |
| --- | --- | --- |
| pcc| <code>String</code> | PCC to place booking. |
| queue | <code>String</code> | Queue number to place booking. |
| pnr | <code>String</code> | 1G PNR. |

**See: <a href="../examples/Air/queue.js">Queue example</a>**


<a name="importPNR"></a>
### .importPNR(params)
Import and Retrieve returns same result so we united this functions into single one.
If the Universal Record locator code is known, a Universal Record can be retrieved by using the Universal Record Retrieve request. Whenever possible, any PNR data stored in the Universal Record is validated against the PNR data in the provider's system.

**Returns**: <code>Promise</code>. - All Information for requested PNR.
**See**: [Importing PNR](https://support.travelport.com/webhelp/uapi/uAPI.htm#Booking/UniversalRecord/Importing_PNRs.htm)


| Param | Type | Description |
| --- | --- | --- |
| pnr | <code>String</code> | 1G PNR. |

**See: <a href="../examples/Air/import.js">Import example</a>**


<a name="flightInfo"></a>
### .flightInfo(params)
Request for the flight information.

**Returns**: <code>Promise</code>
**See**: [Flight Information](https://support.travelport.com/webhelp/uapi/uAPI.htm#Air/Flight_Information/Flight_Information.htm)

| Param | Type | Description |
| --- | --- | --- |
| airline | <code>string</code> | The marketing carrier for the segment. |
| departure | <code>string</code> | The departure date; either the current date or a date in the future, not include the time zone which is derived from the origin location. |
| flightNumber | <code>string</code> | The flight number for the segment |

**See: <a href="../examples/Air/flightInfo1.js">FlightInfo basic example</a>**, **<a href="../examples/Air/flightInfo2.js">FlightInfo multiple items example</a>**
