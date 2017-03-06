# Hotels :hotel:

Current version of package provides Travelport Rooms and More via Universal API content.

Read [docs](https://goo.gl/qEHwiz) for more information.

```javascript
// HotelService creation example

var uAPI = require('uapi-json');
var auth = {
   username: 'someusename',
   password: 'some password',
   targetBranch: 'some tb',
};
var HotelService = uAPI.createHotelService(auth, 0, true);

```

# API

**HotelService**
* [.search(params)](#search)
* [.rates(params)](#rates)
* [.book(params)](#book)
* [.cancelBook(params)](#cancel)

## .search(params)
<a name="search"></a>
Synchronous Hotel Search returns a list of available hotel property offers that meet the requested search criteria. The Hotel Search is the first transaction in the workflow for Hotel Shopping and Booking.

**Returns**: `Promise`
**See**: [Synchronous Hotel Search](https://support.travelport.com/webhelp/uapi/uAPI.htm#Hotel/Hotel_TRM/TRM_Synchronous_Hotel_Search_15-4.htm%3FTocPath%3DHotel%7CTravelport%2520Rooms%2520and%2520More%2520via%2520Universal%2520API%7CTravelport%2520Rooms%2520and%2520More%2520Workflow%7CHotel%2520Search%7CSynchronous%2520Hotel%2520Search%7C_____2)

| Param | Type | Description |
| --- | --- | --- |
| location | `String` | IATA Code of City/Airport to search hotels. |
| startDate | `String` | Check-in date in format `YYYY-MM-DD`. |
| endDate | `String` | Check-in date in format `YYYY-MM-DD`. |
| rooms | `Array<Room>` | Array of `Room` objects. See below. |
| _[MaxWait]_ | `Number` | Max wait for results. |
| _[MaxProperties]_ | `Number` | Max properties to return. |
| _[currency]_ | `String` | Preferred currecny. |
| _[rating]_ | `Array` | Array of ratings needed to search. Ex `[3, 4, 5]` for 3,4,5-star hotels. |

### Room object
One element in `rooms` array = 1 room to search.
Each room contains next object:

| Param | Type | Description |
| --- | --- | --- |
| adults | `Number` | Number of adults. |
| children | `Array<Number>` | Each element === one child. Number - child age. Ex. `[10, 12]` means two children 10 and 12 years old.|

**See: <a href="../examples/Hotels/search">Search example</a>**

## .rates(params)
<a name="rates"></a>
A Hotel Rate and Rule Search, also known as a Complete Hotel Availability, returns room rates and rate rules for a specified hotel property offer. After the user/traveler has selected a property from the Hotel Search response, a more detailed search for rates for the property and stay can be made.

**Returns**: `Promise`
**See**: [Stand-Alone Hotel Rate and Rule Search](https://support.travelport.com/webhelp/uapi/uAPI.htm#Hotel/Hotel_TRM/TRM_StandAlone_HotelRateAndRuleSearch.htm%3FTocPath%3DHotel%7CTravelport%2520Rooms%2520and%2520More%2520via%2520Universal%2520API%7CTravelport%2520Rooms%2520and%2520More%2520Workflow%7CHotel%2520Rate%2520and%2520Rule%2520Search%7C_____2)

| Param | Type | Description |
| --- | --- | --- |
| HotelChain | `String` | Chain from search response. |
| HotelCode | `String` | Hotel code from search response. |
| startDate | `String` | Check-in date in format `YYYY-MM-DD`. |
| endDate | `String` | Check-in date in format `YYYY-MM-DD`. |
| rooms | `Array<Room>` | Array of `Room` objects. See above. |
| Suppliers | `Array<SupplierCode>` | Array of supliers codes. Ex. `['AG', 'RS']` |
| _[HostToken]_ | `String` | HostToken for non-standalone request. |
| _[currency]_ | `String` | Preferred currency. |

**See: <a href="../examples/Hotels/rate">Rates example</a>**

## .book(params)
<a name="book"></a>
After a hotel property and rate is selected in the Hotel Rate and Rule Search response, the hotel segment can be reserved.

**Returns**: `Promise`
**See**: [Creating Hotel Bookings](https://support.travelport.com/webhelp/uapi/uAPI.htm#Hotel/Hotel_TRM/TRM_Create_Booking.htm%3FTocPath%3DHotel%7CTravelport%2520Rooms%2520and%2520More%2520via%2520Universal%2520API%7CTravelport%2520Rooms%2520and%2520More%2520Workflow%7CHotel%2520Booking%7CCreating%2520Bookings%7C_____1)

| Param | Type | Description |
| --- | --- | --- |
| people | `Arrat<People>` | People array. [See below](#people) |
| Guarantee | `Object` | Credit Card information. [See below](#guarantee)   |
| rates | `Array<Rate>` | Selected rates for booking. [See below](#rates-obj)  |
| roomsRefs | `Array<RoomRef>` | Array of linked people to rooms. [See below](#refs)  |
| HotelChain | `String` | Chain from search response. |
| HotelCode | `String` | Hotel code from search response. |
| startDate | `String` | Check-in date in format `YYYY-MM-DD`. |
| endDate | `String` | Check-in date in format `YYYY-MM-DD`. |
| HostToken | `String` | HostToken for non-standalone request. |

### People object
<a name="people"></a>
First element should contain contact information
Each people object has nex fields:

| Param | Type | Description |
| --- | --- | --- |
| key | `Number` | Unique key. Will be used in `RoomRef` object. |
| TravelerType | `String`| One of `[ ADT, CHD ]`. |
| _[Age]_ | `Number` | Requried for child. Age in years. |
| FirstName | `String` | First name. |
| LastName | `String` | Last name. |
| PrefixName | `String` | One of `[MISS, MR, MRS]`. |
| Nationality | `String` | 2-letter country code. Ex. `US` |
| BirthDate | `String` | Date in format `YYYY-MM-DD`. |
| AreaCode | `Number` | [Area code](https://en.wikipedia.org/wiki/Telephone_numbering_plan#Area_code) of phone number. |
| CountryCode | `Number` | [Country code](https://en.wikipedia.org/wiki/Telephone_numbering_plan#Country_code) of phone number. |
| Number | `Number` | Phone number. |
| Email | `String` | Email adress. |
| Country | `String` | 2-letter country code. Ex. `US`. |
| City | `String` | City name. |
| Street | `String` | Street name. |
| PostalCode | `Number` | Postal code. |

### Guarantee object
<a name="guarantee"></a>
Object that store information about credit card.

| Param | Type | Description |
| --- | --- | --- |
| CVV | `Number` | 3-digit number. |
| ExpDate | `String`| Expiration date in format `YYYY-MM`. |
| CardHolder | `String` | Name of card holder. Should have 2 words.  |
| CardNumber | `String` | Card number. |
| CardType | `String` | 2-letter card type. Ex. `MC` for Mastercard. `VI` for Visa.|
| BankName | `String` | Credit card bank name. |
| BankCountryCode | `String` | 2-letter country code. |

### Rate object
<a name="rates-obj"></a>
Each rate object can be cloned from *rate* response.
Has next shape:

| Param | Type |
| --- | --- | --- |
| RatePlanType | `String`
| RateSupplier | `String`
| RateOfferId | `String`
| Total | `String`
| Base | `String`
| Surcharge | `String`
| Tax | `String`


### RoomRef object
<a name="refs"></a>
Each object represents one room and people from `people` array, that are linked to this room.

| Param | Type | Description |
| --- | --- | --- |
| adults | `Number` | Count of adults in room. |
| adultsRefs | `Array<key>`| Keys from `people` array. |
| children | `Object{age, key}` | Object with age and key of children.  |

**See: <a href="../examples/Hotels/book">Book example</a>**

## .cancelBook(params)
<a name="cancel"></a>
Currently, cancellation is supported only for single room hotel reservations.
Hotel cancellation via Universal API or the Travelport Rooms and More web site is not supported for multiple rooms in this release. The aggregator must be contacted directly to cancel or modify a multiple room booking.

**Returns**: `Promise`
**See**: [Canceling Hotel Bookings](https://support.travelport.com/webhelp/uapi/uAPI.htm#Hotel/Hotel_TRM/TRM%20Hotel%20Cancel.htm#MultiRoom)

| Param | Type | Description |
| --- | --- | --- |
| LocatorCode | `String` | Locator code from **book** resonse. |

### Example

**See: <a href="../examples/Hotels/cancel">Cancel example</a>**
