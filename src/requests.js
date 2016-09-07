// all pathes for files
const path = require('path');

const xmlDir = path.join(__dirname, 'XMLtemplates');
module.exports = {
  HotelsService: {
    HOTELS_SEARCH_GALILEO_REQUEST: xmlDir + '/003-01_1G_HotelSearch_Rq.xml',
    HOTELS_SEARCH_REQUEST: xmlDir + '/003-01_TRM_HotelSearch_Rq.xml',
    HOTELS_RATE_REQUEST: xmlDir + '/003-02_TRM_HotelRateAndRuleSearch_Rq.xml',
    HOTELS_BOOK_REQUEST: xmlDir + '/003-03_TRM_HotelBook_Rq.xml',
    HOTELS_CANCEL_BOOK_REQUEST: xmlDir + '/003-05_TRM_UnivRecordCancel_Rq.xml',
  },

  AirService: {
    AIR_LOW_FARE_SEARCH_REQUEST: xmlDir + '/024-01_1G_AirLowFareSearch-Sync_Rq.xml',
    AIR_AVAILABILITY_REQUEST: xmlDir + '/Avail_Rq.xml',
    AIR_PRICE_REQ: xmlDir + '/104-02_1G_AirPrice_Rq.xml', // segments from uAPI keys
    AIR_PRICE_REQ_MANUAL: xmlDir + '/AirPricing_FareRules.manual_segments.xml', // manual segments
    AIR_CREATE_RESERVATION_REQUEST: xmlDir + '/104-03_1G_AirBook_Rq_pricingSolutionXML.xml',
    AIR_CREATE_RESERVATION_REQUEST_MANUAL: xmlDir + '/104-03_1G_AirBook_Rq.xml',
    AIR_TICKET_REQUEST: xmlDir + '/104-04_1G_AirTicket_Rq.xml',

    AIR_PRICING_FARE_RULES: xmlDir + '/AirPricing_FareRules.manual_segments.xml',
    FARE_RULES_REQUEST: xmlDir + '/FareRules_uAPI.xml',

  },

  UniversalRecord: {
    UNIVERSAL_RECORD_IMPORT_SIMPLE_REQUEST: xmlDir + '/UniversalRecordImportReq.xml',
  },

  UtilsService: {
    CURRENCY_CONVERSION: xmlDir + '/UTILS_Currency_Conversion.xml',
  },

  GdsQueueService: {
    GDS_QUEUE_PLACE: xmlDir + '/GdsQueuePlaceReq.xml',
  },
};
