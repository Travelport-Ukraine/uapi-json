/**
 * Created by juice on 6/23/16.
 */

var uAPI_lib = require('../../index');//.lib;
var config = require('../testconfig.smart.js')['36d5'];


var AirService = uAPI_lib.createAirService_by_auth(
    config.username,
    config.password,
    config.targetBranch,
    '7e53',
    true //debug
);

var params = {
    queue: '50',
    pcc: '7e53',
    pnr: 'E11LTI',
}

AirService.GDSQueue(params)
    .then(function(data){
        console.log(JSON.stringify(data, null, 2));
    }, function(err){
        console.log(JSON.stringify(data, null, 2));
    });
