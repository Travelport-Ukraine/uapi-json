const createHotelService = require('./Services/Hotels/HotelsService');
const createAirService = require('./Services/Air/AirService');
const createUtilsService = require('./Services/Utils/UtilsService');
const createTerminalService = require('./Services/Terminal/Terminal');
const commonErrors = require('./error-types');
const requestErrors = require('./Request/RequestErrors');
const airErrors = require('./Services/Air/AirErrors');
const hotelsErrors = require('./Services/Hotels/HotelsErrors');
const utilsErrors = require('./Services/Utils/UtilsErrors');
const terminalErrors = require('./Services/Terminal/TerminalErrors');

const uAPI = {
  createUtilsService,
  createHotelService,
  createAirService,
  createTerminalService,
  errors: {
    Common: commonErrors,
    Request: requestErrors,
    Air: airErrors,
    Hotels: hotelsErrors,
    Utils: utilsErrors,
    Terminal: terminalErrors,
  },
};

module.exports = uAPI;
