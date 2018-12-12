const assert = require('assert');
const { expect } = require('chai');
const handlebars = require('handlebars');
const uAPI = require('../src/Request/uapi-request');
const prepareRequest = require('../src/Request/prepare-request');
const { errors } = require('../src');
const config = require('../src/config');
const auth = require('./testconfig');

describe('uapiRequest tests', () => {
  it('should return error when request file not exists', () => {
    const missedFile = 'im the best missing filename';
    try {
      uAPI(config().HotelsService.url, auth, missedFile);
    } catch (err) {
      assert(err instanceof errors.Request.RequestRuntimeError.TemplateFileMissing);
    }
  });

  it('should give undefined request error', () => {
    try {
      uAPI(config().HotelsService.url, auth, undefined);
    } catch (err) {
      assert(err instanceof errors.Request.RequestValidationError.RequestTypeUndefined);
    }
  });

  it('should give auth data error', () => {
    try {
      uAPI(config().HotelsService.url, {}, undefined);
    } catch (err) {
      assert(err instanceof errors.Request.RequestValidationError.AuthDataMissing);
    }
  });

  it('should give auth service url not provided error', () => {
    try {
      uAPI(null, auth, undefined);
    } catch (err) {
      assert(err instanceof errors.Request.RequestValidationError.ServiceUrlMissing);
    }
  });

  it('should uppercase provided PCC', () => {
    const emulatePcc = 'pcc';
    const template = handlebars.compile('{{#if emulatePcc}}{{emulatePcc}}{{/if}}');
    const request = prepareRequest(template, { emulatePcc }, {});
    expect(request).to.equal('PCC');
  });

  it('should has specific provider', () => {
    const provider = '1V';
    const template = handlebars.compile('{{#if provider}}{{provider}}{{/if}}');
    const request = prepareRequest(template, { provider }, {});
    expect(request).to.equal('1V');
  });
});
