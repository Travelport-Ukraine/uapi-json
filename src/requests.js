// all pathes for files
module.exports = {
  HotelsService: {
    HOTELS_SEARCH_GALILEO_REQUEST: __dirname + '/XMLtemplates/003-01_1G_HotelSearch_Rq.xml',
    HOTELS_SEARCH_REQUEST: __dirname + '/XMLtemplates/003-01_TRM_HotelSearch_Rq.xml',
    HOTELS_RATE_REQUEST: __dirname + '/XMLtemplates/003-02_TRM_HotelRateAndRuleSearch_Rq.xml',
    HOTELS_BOOK_REQUEST: __dirname + '/XMLtemplates/003-03_TRM_HotelBook_Rq.xml',
    HOTELS_CANCEL_BOOK_REQUEST: __dirname + '/XMLtemplates/003-05_TRM_UnivRecordCancel_Rq.xml',
  },

  AirService: {
    AIR_LOW_FARE_SEARCH_REQUEST: __dirname + '/XMLtemplates/024-01_1G_AirLowFareSearch-Sync_Rq.xml',
    AIR_AVAILABILITY_REQUEST: __dirname + '/XMLtemplates/Avail_Rq.xml',
    AIR_PRICE_REQ: __dirname + '/XMLtemplates/104-02_1G_AirPrice_Rq.xml', // segments from uAPI keys
    AIR_PRICE_REQ_MANUAL: __dirname + '/XMLtemplates/AirPricing_FareRules.manual_segments.xml', // manual segments
    AIR_CREATE_RESERVATION_REQUEST: __dirname + '/XMLtemplates/104-03_1G_AirBook_Rq_pricingSolutionXML.xml',
    AIR_CREATE_RESERVATION_REQUEST_MANUAL: __dirname + '/XMLtemplates/104-03_1G_AirBook_Rq.xml',
    AIR_TICKET_REQUEST: __dirname + '/XMLtemplates/104-04_1G_AirTicket_Rq.xml',

    AIR_PRICING_FARE_RULES: __dirname + '/XMLtemplates/AirPricing_FareRules.manual_segments.xml',
    FARE_RULES_REQUEST: __dirname + '/XMLtemplates/FareRules_uAPI.xml',

  },

  UniversalRecord: {
    UNIVERSAL_RECORD_IMPORT_SIMPLE_REQUEST: __dirname + '/XMLtemplates/UniversalRecordImportReq.xml',
  },

  UtilsService: {
    CURRENCY_CONVERSION: __dirname + '/XMLtemplates/UTILS_Currency_Conversion.xml',
  },

  GdsQueueService: {
    GDS_QUEUE_PLACE: __dirname + '/XMLtemplates/GdsQueuePlaceReq.xml',
  },
};
