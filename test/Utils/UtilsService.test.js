var proxy        = require('proxyquire'),
  sinon          = require('sinon'),
  assert         = require('assert'),
  moment         = require('moment'),
  assign         = require('object-assign');

var uAPI         = require('../../index');
var config       = require('../testconfig.js');
var UtilsService = uAPI.createUtilsService(
  config.username,
  config.password,
  config.targetBranch,
  2
);


describe('#UtilsService', function () {
  describe('currencyConvert()', function () {
    it('give response object', function () {
      this.timeout('200000');
      return UtilsService.currencyConvert({currencies: [{from: 'EUR', to: 'USD'}, {from: 'UAH', to: 'USD'}]}).then(function(data) {

      }, function(err) { console.log(err)});
    });
  });
})
