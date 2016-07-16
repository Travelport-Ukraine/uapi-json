# Description
Best Travelport Universal API wrapper ever :airplane: :mountain_railway: :hotel: 

Travelport Universal API offers an array of travel content for air, hotel, car, and rail, including ancillaries (optional services). It also provides functionality to build complete traveler, agency, branch, and account profiles.

Read [official docs](https://support.travelport.com/webhelp/uapi/uAPI.htm) for more information.

This package provides simple interfaces for uAPI.

# Usage
First install package with `npm install --save uapi-json`.

After that you can use one of functions to create service that you need:

* **uAPI**
    * .**createAirService**(username, password, targetBranch, [debug]) ⇒ <code>[AirService](docs/Air.md)</code>
    * .**createHotelService**(username, password, targetBranch, [debug])  ⇒ <code>[HotelService](docs/Hotels.md)</code>
    * .**createUniversalService**(username, password, targetBranch, [debug]) ⇒ <code>[UniversalService](docs/Universal)</code>
    * .**createUtilsService**(username, password, targetBranch, [debug]) ⇒ <code>[UtilsService](docs/Utils.md)</code>

`Username`, `password` and `targetBranch` can be found in your credentials provided by Travelport.

There are 3 types of `debug` mode:

* `debug=0` - disabled any logs.
* `debug=1` - logging only request params, request xml and error if it's occured.
* `debug=2` - same as 1 but also logging all response xml (due to lot of text to log).
