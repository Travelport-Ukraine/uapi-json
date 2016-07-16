/**
 * Created by juice on 6/13/16.
 */

var AirParser = require('../../lib/Air/AirParser');
var uAPI_Parser = require('../../lib/uAPI_Parser');
var fs = require('fs');
var parseString = require('xml2js').parseString;


var contents = fs.readFileSync("../XMLtemplates/AirPriceRsp - adults, infant.xml");
// Define to JSON type
parseString(contents, function(err, result) {
    var Parser = new uAPI_Parser('v36_0');
    var AirPrice = AirParser.AIR_PRICE_REQUEST.call(Parser, result["SOAP:Envelope"]["SOAP:Body"][0]);

    console.log(JSON.stringify(AirPrice, null, 2));
});