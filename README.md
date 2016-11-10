# Description [![Build Status](https://travis-ci.org/Travelport-Ukraine/uapi-json.svg?branch=master)](https://travis-ci.org/Travelport-Ukraine/uapi-json)
Best Travelport Universal API wrapper ever :airplane: :mountain_railway: :hotel:

Wrapper for [Travelport Universal API](https://developer.travelport.com/app/developer-network/universal-api).
Read [official docs](https://support.travelport.com/webhelp/uapi/uAPI.htm) for more information.

Travelport Universal API offers an array of travel content for air, hotel, car, and rail, including ancillaries (optional services). It also provides functionality to build complete traveler, agency, branch, and account profiles.

This package provides JSON/Promises interface for SOAP calls. Requires uAPI credentials to run.

# Contents

* [Installation](#installation)
* [Basic usage](#usage)
* [Settings](#settings)
* [Services](#services)

# Installation
<a name="installation"></a>

Install package with `npm install --save uapi-json`.

# Basic usage
<a name="usage"></a>

This package exports an object with three service constructors.

```javascript
const uAPI = rqeuire('uapi-json');

const AirService = uAPI.createAirService(settings);
const HotelService = uAPI.createHotelService(settings);
const UtilsService = uAPI.createUtilsService(settings);
const TerminalService = uAPI.createTerminalService(settings);
```

It also exports a set of error classes that help to check errors against them

```javascript
const uAPI = require('uapi-json');

const settings = { auth: {username: 'USERNAME', password: 'PASSWORD'}};
const AirService = uAPI.createAirService(settings);

AirService.importPNR().catch((err) => {
  if (err instanceof uAPI.errors.Common.ValidationError) {
    console.log('Validation error occured');
  }
  if (err instanceof uAPI.errors.Request.RequestValidationError) {
    console.log('Validation error occured in request');
  }
  if (err instanceof uAPI.errors.Request.RequestValidationError.ParamsMissing) {
    console.log('Params are missing for request');
  }
});
```

As [`node-errors-helpers`](https://github.com/Travelport-Ukraine/errors-helpers) library
is used for errors generating, we strongly reccomend you to tak a look at it.
It also has several useful helpers to handle errors.

# Settings
<a name="settings"></a>

## uAPI
* `.createAirService(settings)` ⇒ [`AirService`](docs/Air.md)
* `.createHotelService(settings)`  ⇒ [`HotelService`](docs/Hotels.md)
* `.createUtilsService(settings)` ⇒ [`UtilsService`](docs/Utils.md)
* `.createTerminalService(settings)` ⇒ [`TerminalService`](docs/Terminal.md)
* `.createFlightService(settings)` ⇒ [`FlightService`](docs/FlightService.md)

### Settings object

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| auth | `Object <username, password, targetBranch>` | - | See `auth` description [below](#auth). |
| debug | `Number` | `0` | Can be `0`, `1`, or `2`. |
| production | `Boolean` | `true` | Production variable is connected with production and pre-production environment. Can be true for production and false for pre-production. For more information read docs. |
| emulatePcc | `String` | - | Optional. Used for `TerminalService` only. See [`TerminalService`](docs/Terminal.md) |
| timeout | `Number` | - | Optional. Used for `TerminalService` only. See [`TerminalService`](docs/Terminal.md) |

### Auth object
<a name="auth"></a>
`username`, `password` and `targetBranch` should be set in `auth` object and provided by Travelport.

There are 3 types of `debug` mode:

* `debug=0` - disabled any logs.
* `debug=1` - logging only request params, request xml and error if it's occurred.
* `debug=2` - same as 1 but also logging all response xml (due to lot of text to log).

# Services
<a name="services"></a>
See the following services pages to take a detailed view
* [`AirService`](docs/Air.md)
* [`HotelService`](docs/Hotels.md)
* [`UtilsService`](docs/Utils.md)
* [`TerminalService`](docs/Terminal.md)


# Contributing
Please visit [CONTRIBUTING.md](/CONTRIBUTING.md)




