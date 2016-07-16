function urls(region, production) {
    var prefix = '';
    var timeout = 200000;
    if (!production) {
        prefix = 'pp.';
        timeout = 100000;
    }
    return {
        timeout: timeout,
        HotelsService : {
            url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/HotelService'
        },
        AirService: {
            url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/AirService'
        },
        UniversalRecord: {
            url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/UniversalRecordService'
        },
        CurrencyConversion: {
            url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/CurrencyConversionService'
        },
        GdsQueueService: {
            url: 'https://' + region + '.universal-api.'
            + prefix + 'travelport.com/B2BGateway/connect/uAPI/GdsQueueService'
        },
    };
}

module.exports = function(region) {
    if (region === undefined){
        region = 'emea';
    }
    return urls(region, process.env.NODE_ENV === "production");
}
