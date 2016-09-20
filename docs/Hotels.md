# Hotels :hotel:

Current version of package provides Travelport Rooms and More via Universal API content.

Read [docs](https://goo.gl/qEHwiz) for more information.

```JavaScript
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

* **HotelService**
    * [.search(params)](#search) ⇒ <code>Promise</code>
    * [.rates(params)](#rates)  ⇒ <code>Promise</code>
    * [.book(params)](#book) ⇒ <code>Promise</code>
    * [.cancelBook(params)](#cancel) ⇒ <code>Promise</code>

<a name="search"></a>
### .search(params)
Synchronous Hotel Search returns a list of available hotel property offers that meet the requested search criteria. The Hotel Search is the first transaction in the workflow for Hotel Shopping and Booking.

**Returns**: <code>Promise</code>
**See**: [Synchronous Hotel Search](https://support.travelport.com/webhelp/uapi/uAPI.htm#Hotel/Hotel_TRM/TRM_Synchronous_Hotel_Search_15-4.htm%3FTocPath%3DHotel%7CTravelport%2520Rooms%2520and%2520More%2520via%2520Universal%2520API%7CTravelport%2520Rooms%2520and%2520More%2520Workflow%7CHotel%2520Search%7CSynchronous%2520Hotel%2520Search%7C_____2)


| Param | Type | Description |
| --- | --- | --- |
| location | <code>String</code> | IATA Code of City/Airport to search hotels. |
| startDate | <code>String</code> | Check-in date in format `YYYY-MM-DD`. |
| endDate | <code>String</code> | Check-in date in format `YYYY-MM-DD`. |
| rooms | <code>Array<Room></code> | Array of `Room` objects. See below. |
| _[MaxWait]_ | <code>Number</code> | Max wait for results. |
| _[MaxProperties]_ | <code>Number></code> | Max properties to return. |
| _[currency]_ | <code>String></code> | Preferred currecny. |
| _[rating]_ | <code>Array</code> | Array of ratings needed to search. Ex `[3, 4, 5]` for 3,4,5-star hotels. |

#### Room object
One element in `rooms` array = 1 room to search.
Each room contains next object:

| Param | Type | Description |
| --- | --- | --- |
| adults | <code>Number</code> | Number of adults. |
| children | <code>Array\<Number\></code> | Each element === one child. Number - child age. Ex. `[10, 12]` means two children 10 and 12 years old.|

**See: <a href="../examples/Hotels/search">Search example</a>**

<a name="rates"></a>
### .rates(params)
A Hotel Rate and Rule Search, also known as a Complete Hotel Availability, returns room rates and rate rules for a specified hotel property offer. After the user/traveler has selected a property from the Hotel Search response, a more detailed search for rates for the property and stay can be made.

**Returns**: <code>Promise</code>
**See**: [Stand-Alone Hotel Rate and Rule Search](https://support.travelport.com/webhelp/uapi/uAPI.htm#Hotel/Hotel_TRM/TRM_StandAlone_HotelRateAndRuleSearch.htm%3FTocPath%3DHotel%7CTravelport%2520Rooms%2520and%2520More%2520via%2520Universal%2520API%7CTravelport%2520Rooms%2520and%2520More%2520Workflow%7CHotel%2520Rate%2520and%2520Rule%2520Search%7C_____2)


| Param | Type | Description |
| --- | --- | --- |
| HotelChain | <code>String</code> | Chain from search response. |
| HotelCode | <code>String</code> | Hotel code from search response. |
| startDate | <code>String</code> | Check-in date in format `YYYY-MM-DD`. |
| endDate | <code>String</code> | Check-in date in format `YYYY-MM-DD`. |
| rooms | <code>Array<Room></code> | Array of `Room` objects. See above. |
| Suppliers | <code>Array<supplier code></code> | Array of supliers codes. Ex. `['AG', 'RS']` |
| _[HostToken]_ | <code>String</code> | HostToken for non-standalone request. |
| _[currency]_ | <code>String</code> | Preferred currency. |

**See: <a href="../examples/Hotels/rate">Rates example</a>**

<a name="book"></a>
### .book(params)
After a hotel property and rate is selected in the Hotel Rate and Rule Search response, the hotel segment can be reserved.

**Returns**: <code>Promise</code>
**See**: [Creating Hotel Bookings](https://support.travelport.com/webhelp/uapi/uAPI.htm#Hotel/Hotel_TRM/TRM_Create_Booking.htm%3FTocPath%3DHotel%7CTravelport%2520Rooms%2520and%2520More%2520via%2520Universal%2520API%7CTravelport%2520Rooms%2520and%2520More%2520Workflow%7CHotel%2520Booking%7CCreating%2520Bookings%7C_____1)


| Param | Type | Description |
| --- | --- | --- |
| people | <code>Arrat\<People\></code> | People array. [See below](#people) |
| Guarantee | <code>Object</code> | Credit Card information. [See below](#guarantee)   |
| rates | <code>Array\<Rate\></code> | Selected rates for booking. [See below](#rates-obj)  |
| roomsRefs | <code>Array\<RoomRef\></code> | Array of linked people to rooms. [See below](#refs)  |
| HotelChain | <code>String</code> | Chain from search response. |
| HotelCode | <code>String</code> | Hotel code from search response. |
| startDate | <code>String</code> | Check-in date in format `YYYY-MM-DD`. |
| endDate | <code>String</code> | Check-in date in format `YYYY-MM-DD`. |
| HostToken | <code>String</code> | HostToken for non-standalone request. |

<a name="people"></a>
#### People object
First element should contain contact information
Each people object has nex fields:

| Param | Type | Description |
| --- | --- | --- |
| key | <code>Number</code> | Unique key. Will be used in `RoomRef` object. |
| TravelerType | <code>String</code>| One of `[ ADT, CHD ]`. |
| _[Age]_ | <code>Number</code> | Requried for child. Age in years. |
| FirstName | <code>String</code> | First name. |
| LastName | <code>String</code> | Last name. |
| PrefixName | <code>String</code> | One of `[MISS, MR, MRS]`. |
| Nationality | <code>String</code> | 2-letter country code. Ex. `US` |
| BirthDate | <code>String</code> | Date in format `YYYY-MM-DD`. |
| AreaCode | <code>Number</code> | [Area code](https://en.wikipedia.org/wiki/Telephone_numbering_plan#Area_code) of phone number. |
| CountryCode | <code>Number</code> | [Country code](https://en.wikipedia.org/wiki/Telephone_numbering_plan#Country_code) of phone number. |
| Number | <code>Number</code> | Phone number. |
| Email | <code>String</code> | Email adress. |
| Country | <code>String</code> | 2-letter country code. Ex. `US`. |
| City | <code>String</code> | City name. |
| Street | <code>String</code> | Street name. |
| PostalCode | <code>Number</code> | Postal code. |

<a name="guarantee"></a>
#### Guarantee object
Object that store information about credit card.

| Param | Type | Description |
| --- | --- | --- |
| CVV | <code>Number</code> | 3-digit number. |
| ExpDate | <code>String</code>| Expiration date in format `YYYY-MM`. |
| CardHolder | <code>String</code> | Name of card holder. Should have 2 words.  |
| CardNumber | <code>String</code> | Card number. |
| CardType | <code>String</code> | 2-letter card type. Ex. `MC` for Mastercard. `VI` for Visa.|
| BankName | <code>String</code> | Credit card bank name. |
| BankCountryCode | <code>String</code> | 2-letter country code. |

<a name="rates-obj"></a>
#### Rate object
Each rate object can be cloned from *rate* response.
Has next shape:

| Param | Type |
| --- | --- | --- |
| RatePlanType | <code>String</code>
| RateSupplier | <code>String</code>
| RateOfferId | <code>String</code>
| Total | <code>String</code>
| Base | <code>String</code>
| Surcharge | <code>String</code>
| Tax | <code>String</code>


<a name="refs"></a>
#### RoomRef object
Each object represents one room and people from `people` array, that are linked to this room.

| Param | Type | Description |
| --- | --- | --- |
| adults | <code>Number</code> | Count of adults in room. |
| adultsRefs | <code>Array<key></code>| Keys from `people` array. |
| children | <code>Object{age, key}</code> | Object with age and key of children.  |

**See: <a href="../examples/Hotels/book">Book example</a>**

<a name="cancel"></a>
### .cancelBook(params)
Currently, cancellation is supported only for single room hotel reservations.
Hotel cancellation via Universal API or the Travelport Rooms and More web site is not supported for multiple rooms in this release. The aggregator must be contacted directly to cancel or modify a multiple room booking.

**Returns**: <code>Promise</code>
**See**: [Canceling Hotel Bookings](https://support.travelport.com/webhelp/uapi/uAPI.htm#Hotel/Hotel_TRM/TRM%20Hotel%20Cancel.htm#MultiRoom)

| Param | Type | Description |
| --- | --- | --- |
| LocatorCode | <code>String</code> | Locator code from **book** resonse. |

#### Example

**See: <a href="../examples/Hotels/cancel">Cancel example</a>**
