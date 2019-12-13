const createHotelService = require('./Services/Hotels/HotelsService');
const createAirService = require('./Services/Air/Air');
const createUtilsService = require('./Services/Utils/UtilsService');
const createTerminalService = require('./Services/Terminal/Terminal');
const commonErrors = require('./error-types');
const requestErrors = require('./Request/RequestErrors');
const airErrors = require('./Services/Air/AirErrors');
const hotelsErrors = require('./Services/Hotels/HotelsErrors');
const utilsErrors = require('./Services/Utils/UtilsErrors');
const terminalErrors = require('./Services/Terminal/TerminalErrors');
const errorCodes = require('./error-codes.js');

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
  errorCodes,
};

module.exports = uAPI;
