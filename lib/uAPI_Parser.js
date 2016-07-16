/**
 * Created by juice on 6/10/16.
 */

var _ = require('lodash');
var async = require('async');

//move to lib or import from npm
Object.defineProperty(Object.prototype, 'renameProperty',
    {
        enumerable: false,
        writable: true,
        value: function (oldName, newName) {
            // Do nothing if the names are the same
            if (oldName == newName) {
                return this;
            }
            // Check for the old property name to avoid a ReferenceError in strict mode.
            if (this.hasOwnProperty(oldName)) {
                this[newName] = this[oldName];
                delete this[oldName];
            }
            return this;
    }
});



Object.defineProperty(Object.prototype, 'first',
    {
        enumerable: false,
        writable: true,
        value: function() {
            var first;
            for (var i in this) {
                if (this.hasOwnProperty(i) && typeof(i) !== 'function') {
                    first = this[i];
                    break;
                }
            }

            return first;
    }
});

//common func for all XML keyed
// air:*List types (FlightDetailsList, AirSegmentList, FareInfoList, RouteList, AirPricePointList)
var getItemEmbKey = function(item, key) { //TODO: for branded fares, air:Brand is referred by BrandID or BrandFound=false and keys are useless
    if (item['$'] && item['$'].Key)
        return item['$'].Key;
    else return false;
};

var mergeLeaf = function(item) {
    var leaf = item['$'];
    delete(item['$']);
    //item.renameProperty('_', 'text'); //TODO decide if _ is the best name
    return _.extend(item, leaf);
};


/*
 * Default parsing algorithm configuration (for all responses)
 */

var defaultConfig = function(ver) {

    //do not collapse arrays with single objects or objects with single keys if they have this name
    var noCollapseList = ['air:BookingInfo', 'air:FareRule',
        'common_'+ver+':SSR', //there's one SSR per each airline (per each passenger), they are usually identical
        'air:AirReservation',
        'air:PassengerType',
        'common_'+ver+':ResponseMessage',

        'air:BaggageAllowanceInfo',
        'air:CarryOnAllowanceInfo'
    ];

    //Non-single field objects don't get collapsed from single item arrays into objects automatically, e.g.
    // air:AirReservation
    // air:AirSegment
    // universal:ProviderReservationInfo


    //Some single-object arrays with one key can be safely collapsed into an object or a scalar,
    //because they would never have a second item or any more fields in objects
    //NOTE: if such array name ends in list, e.g. FlightOptionsList (with FlightOption item), they will not get collapsed
    var fullCollapseList_obj = [
        'air:FareTicketDesignator',
        'common_'+ver+':Address',
        'common_'+ver+':Email',
        'common_'+ver+':ShippingAddress',
        'common_'+ver+':PhoneNumber',
        'common_'+ver+':ProviderReservationInfoRef', //TODO check if can be collapsed

        'air:PassengerType', //collapses into array of codes, e.g. in AirPriceRsp/AirPriceResult/AirPricingSolution/AirPricingInfo

        //'air:ChangePenalty', //TODO can be a list of penalties both amount and percent?
        'air:TextInfo',
        'air:FareNote' //removes useless keys

    ];
    //NOTE: for air:PassengerType '$' with one member will get collapsed
    //can't collapse objs: air:ChangePenalty (amount and/or percent), air:Connection, other keyed lists

    //Some keyed objects' keys are utterly useless, e.g. in air:FareNote where GDS text is displayed
    // good to use together with fullCollapseList_obj
    var dropKeys = [
        'air:FareNote'
    ];

    //Some single-object arrays might have a keyed object, but we guarantee that there will never be more than one
    var fullCollapseSingleKeyed_obj = [
        //'air:FlightDetails' //can't collapse those in AirPriceRsp/AirItinerary/AirSegment, because they might list several tech stops on flight segment
    ];

    //Keyed lists that contain empty objects can get collapsed into arrays of keys
    var CollapseKeysOnly = [
        'air:FlightDetailsRef', //can be a list of several tech stops
        'air:AirSegmentRef',
        /*'air:FareInfoRef',*/
        'common_'+ver+':BookingTravelerRef',
        'common_'+ver+':ProviderReservationInfoRef',
    ];

    return {
        noCollapseList: noCollapseList,
        fullCollapseList_obj: fullCollapseList_obj,
        fullCollapseSingleKeyed_obj: fullCollapseSingleKeyed_obj,
        CollapseKeysOnly: CollapseKeysOnly,
        dropKeys: dropKeys
    };
};
///////////////////

var Parser = function(uapi_version, env, config) {
    if (!config)
        this.config = defaultConfig(uapi_version);
    else
        this.config = config;

    this.uapi_version = uapi_version;
    this.env = env;
};

Parser.prototype.mapArrayKeys = function(array, name) {
    var self = this;

    if (this.config.dropKeys.indexOf(name) == -1) {
        var hasAllKeys = true;
        _.forEach(array,
            function (value) {
                hasAllKeys &= (getItemEmbKey(value)) ? true : false;
            }
        );
    } else {
        _.forEach(array,
            function(value) {
                if (value.$) {
                    delete(value.$.Key);
                    if (Object.keys(value.$).length == 0)
                        delete(value.$);
                }
            });
        hasAllKeys = false;
    }


    if (!hasAllKeys) {
        _.forEach(array,
            function (value, key) {
                array[key] = self.mergeLeafRecursive(value, name /*+ ':' + key*/);
            }
        );
        return array;
    } else {
        var object = _.mapKeys(array, getItemEmbKey);
        return self.mergeLeafRecursive(object, name);
    }
};

//TODO make a smart algorithm that checks and simplifies certain structures by metadata description

Parser.prototype.mergeLeafRecursive = function (obj, name) {

    var object;
    var self=this;

    if (_.isArray(obj)) {
        var list_name = (name.substr(-4) == 'List') ? name.substring(0, name.length - 4) : name;

        if (_.size(obj) == 1) {
            if (obj[0][list_name]) {
                //the XML has e.g. air:FlightDetailsList with one node that is air:FlightDetails
                object = this.mapArrayKeys(obj[0][list_name], list_name);
            } else if (list_name.substr(-1) == 's' && (list_name = list_name.substr(0, list_name.length-1))
                && obj[0][list_name]) { //remove plural in one node e.g. FlightOptionsList with FlightOption
                return this.mapArrayKeys(obj[0][list_name], list_name);
            } else if (typeof(obj[0]) == 'object') {
                if (
                    (this.config.noCollapseList.indexOf(name) == -1 && !getItemEmbKey(obj[0])) || //collapse single item
                    (this.config.fullCollapseSingleKeyed_obj.indexOf(name) !== -1)
                   )
                        object = this.mergeLeafRecursive(obj[0], name);
                else //can't collapse, proceeds with keyed object
                    object = this.mapArrayKeys(obj, list_name);
            } else
                return obj[0]; //single scalar in array
        }
        else
            object = this.mapArrayKeys(obj, list_name);

    } else if (_.isObject(obj)) {
        object = obj;
        var keys = Object.keys(object);

        if (this.config.CollapseKeysOnly.indexOf(name) !== -1) return keys;

        if (keys.length == 1 && this.config.fullCollapseList_obj.indexOf(name) !== -1) {
            return this.mergeLeafRecursive(object[keys[0]], name);
        } else
            keys.forEach(function (key) {
                if (typeof(object[key]) == 'object') {
                    if (key == '$')
                        object = mergeLeaf(object);
                    else
                        object[key] = self.mergeLeafRecursive(object[key], key);
                }
            });
    } else return obj;

    if (_.isObject(object))
        return mergeLeaf(object);
    else return object;
};

module.exports = Parser;