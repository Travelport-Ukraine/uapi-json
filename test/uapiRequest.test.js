const assert = require('assert');
const errors = require('../src').errors;
const uAPI = require('../src/Request/uapi-request');
const config = require('../src/config');
const auth = require('./testconfig');
const path = require('path');

describe('uapiRequest tests', () => {
  it('should return error request file not exists', () => {
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
});
