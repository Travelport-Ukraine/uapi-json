# Description
Best Travelport Universal API wrapper ever :airplane: :mountain_railway: :hotel:

Travelport Universal API offers an array of travel content for air, hotel, car, and rail, including ancillaries (optional services). It also provides functionality to build complete traveler, agency, branch, and account profiles.

Read [official docs](https://support.travelport.com/webhelp/uapi/uAPI.htm) for more information.

This package provides simple interfaces for uAPI.

# Usage
First install package with `npm install --save uapi-json`.

After that you can use one of functions to create service that you need:

* **uAPI**
    * .**createAirService**(settings) ⇒ <code>[AirService](docs/Air.md)</code>
    * .**createHotelService**(settings)  ⇒ <code>[HotelService](docs/Hotels.md)</code>
    * .**createUtilsService**(settings) ⇒ <code>[UtilsService](docs/Utils.md)</code>

### Settings object

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| auth | <code>Object\<username, password, targetBranch\></code> | - | See `auth` description [below](#auth). |
| debug | <code>Number</code> | 0 | Can be 0, 1, or 2. |
| production | <code>Boolean</code> | true | Production variable is connected with production and pre-production environment. Can be true for production and false for pre-production. For more information read docs. . |

<a name="auth"></a>
`username`, `password` and `targetBranch` should be set in `auth` object and provided by Travelport.

There are 3 types of `debug` mode:

* `debug=0` - disabled any logs.
* `debug=1` - logging only request params, request xml and error if it's occurred.
* `debug=2` - same as 1 but also logging all response xml (due to lot of text to log).








