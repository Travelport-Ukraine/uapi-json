# Air :airplane:

The Air workflow allows you to do what most travel agents did in the past and what many search engines still do today: book a trip for a customer. Air service provides:

* Air Shop: Search for flight options by lowest fare (LowFareSearch(Asynch)Req) or availability (AirAvailability).
* Air Price: Price the selected flights and request additional information about rules, flight details, and seating.
* Air Book: Book the flights when you are satisfied with the times, price, and rules.

# API

* **AirService**
    * [.shop(params)](#shop) ⇒ <code>Promise</code>
    * .book(params) ⇒ <code>Promise</code>
    * .ticket(params) ⇒ <code>Promise</code>
    * .void(params) ⇒ <code>Promise</code>
    
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


###Examples

#### Shop
Search an open-jaw flight LWO-JKT, JKT-IEV with one adult passenger.
```JavaScript
var uAPI_lib = require('uapi-json');
var auth = {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    targetBranch: process.env.BRANCH,
    pcc: process.env.PCC
};

var AirService = uAPI_lib.createAirService(auth);

var params = {
    legs: [
        {
            from: "LWO",
            to: "JKT",
            departureDate: "2016-07-18"
        },
        {
            from: "JKT",
            to: "IEV",
            departureDate: "2016-07-21"
        }
    ],
    passengers: {
      ADT: 1
      /*
      CNN:1,
      INF: 1,
      INS: 1, //infant with a seat
      */
    },
    cabins: ['Economy'], //['Business'],
    requestId: "4e2fd1f8-2221-4b6c-bb6e-cf05c367cf60"
};

AirService.shop(params)
    .then(function(data){
        console.log(JSON.stringify(data, null, 2));
    }, function(err){
        console.log(JSON.stringify(err));
    });
```
