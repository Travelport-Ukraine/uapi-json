# Description
Best Travelport Universal API wrapper ever :airplane: :mountain_railway: :hotel: 

Travelport Universal API offers an array of travel content for air, hotel, car, and rail, including ancillaries (optional services). It also provides functionality to build complete traveler, agency, branch, and account profiles.

Read [official docs](https://support.travelport.com/webhelp/uapi/uAPI.htm) for more information.

This package provides simple interfaces for uAPI.

# Usage
First install package with `npm install --save uapi-json`.

After that you can use one of functions to create service that you need:

* **uAPI**
    * .**createAirService**(auth, [debug, [production]]) ⇒ <code>[AirService](docs/Air.md)</code>
    * .**createHotelService**(auth, [debug, [production]])  ⇒ <code>[HotelService](docs/Hotels.md)</code>
    * .**createUtilsService**(auth, [debug, [production]]) ⇒ <code>[UtilsService](docs/Utils.md)</code>

`username`, `password` and `targetBranch` should be set in `auth` object and provided by Travelport.

There are 3 types of `debug` mode:

* `debug=0` - disabled any logs.
* `debug=1` - logging only request params, request xml and error if it's occurred.
* `debug=2` - same as 1 but also logging all response xml (due to lot of text to log).

`production` variable is connected with production and pre-production environment. 
Can be `true` for production and `false` for pre-production. For more information read [docs](https://support.travelport.com/webhelp/uapi/uAPI.htm#New_Customer_Path/NewCustomer_PreProd.htm%3FTocPath%3DGetting%2520Started%7CGetting%2520Connected%7CGetting%2520Credentials%7C_____2).

