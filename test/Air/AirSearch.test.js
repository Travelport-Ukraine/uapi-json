var proxy  = require('proxyquire'),
    sinon  = require('sinon');

var uAPI = require('../../index');
var config = require('../testconfig.js');
var AirService = uAPI.createAirService_by_auth(
    {
        auth: config,
        debug: true,
        production: false
    }
);



describe('#Air', function () {
    describe('searchLowFares()', function () {
        it('should respond with fares XML object', function () {
            this.timeout(20000);
            var params = {
                legs: [
                    {
                        from: "IEV",
                        to: "BKK",
                        departureDate: "2016-02-10"
                    },
                    {
                        from: "IEV",
                        to: "BKK",
                        departureDate: "2016-02-20"
                    }
                ],
                passengers: {
                    ADT: 2,
                    INS: 1 //infant with a seat
                },
                requestId: "test-request"
            };
            return AirService.searchLowFares(params)
                .then(function(err){
                    console.log(JSON.stringify(err));
                }, function(err){
                    console.log(JSON.stringify(err));
                });
        });

        it('should fail validation for passengers', function () {
            this.timeout(2000);
            var params = {
                legs: [
                    {
                        from: "IEV",
                        to: "BKK",
                        departureDate: "2016-02-10"
                    },
                    {
                        from: "IEV",
                        to: "BKK",
                        departureDate: "2016-02-20"
                    }
                ],
                passengers: {
                    ADT: "2" //error here - a string
                },
                requestId: "test-request"
            };
            return AirService.searchLowFares(params)
                .then(function(err){
                    console.log(JSON.stringify(err));
                }, function(err){
                    console.log(JSON.stringify(err));
                });
        });

        it('should fail validation for legs', function () {
            this.timeout(2000);
            var params = {
                legs: [
                    {
                        from: "IEV",
                        //to: "BKK", //missing a required field
                        departureDate: "2016-02-10"
                    },
                    {
                        from: "IEV",
                        to: "BKK",
                        departureDate: "2016-02-20"
                    }
                ],
                passengers: {
                    ADT: 2
                },
                requestId: "test-request"
            };
            return AirService.searchLowFares(params)
                .then(function(err){
                    console.log(JSON.stringify(err));
                }, function(err){
                    console.log(JSON.stringify(err));
                });
        });
    });
});
