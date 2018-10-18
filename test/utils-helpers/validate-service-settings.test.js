const validateServiceSettings = require('../../src/utils/validate-service-settings');
const { ServiceError } = require('../../src/error-types');

describe('Service settings validation', () => {
  it('should fail when no settings provided', () => Promise
    .resolve()
    .then(() => validateServiceSettings())
    .then(() => Promise.reject(new Error('PASSED')))
    .catch(err => (
      err instanceof ServiceError.ServiceParamsMissing
        ? Promise.resolve()
        : Promise.reject(err)
    )));
  it('should fail when settings invalid', () => Promise
    .resolve()
    .then(() => validateServiceSettings('STRING'))
    .then(() => Promise.reject(new Error('PASSED')))
    .catch(err => (
      err instanceof ServiceError.ServiceParamsInvalid
        ? Promise.resolve()
        : Promise.reject(err)
    )));
  it('should fail when no settings.auth provided', () => Promise
    .resolve()
    .then(() => validateServiceSettings({}))
    .then(() => Promise.reject(new Error('PASSED')))
    .catch(err => (
      err instanceof ServiceError.ServiceParamsAuthMissing
        ? Promise.resolve()
        : Promise.reject(err)
    )));
  it('should fail when no settings.auth not an object', () => Promise
    .resolve()
    .then(() => validateServiceSettings({
      auth: 'STRING',
    }))
    .then(() => Promise.reject(new Error('PASSED')))
    .catch(err => (
      err instanceof ServiceError.ServiceParamsAuthInvalid
        ? Promise.resolve()
        : Promise.reject(err)
    )));
  it('should fail when no settings.auth does not have username', () => Promise
    .resolve()
    .then(() => validateServiceSettings({
      auth: {},
    }))
    .then(() => Promise.reject(new Error('PASSED')))
    .catch(err => (
      err instanceof ServiceError.ServiceParamsAuthInvalid
        ? Promise.resolve()
        : Promise.reject(err)
    )));
  it('should fail when no settings.auth does not have password', () => Promise
    .resolve()
    .then(() => validateServiceSettings({
      auth: { username: 'USERNAME' },
    }))
    .then(() => Promise.reject(new Error('PASSED')))
    .catch(err => (
      err instanceof ServiceError.ServiceParamsAuthInvalid
        ? Promise.resolve()
        : Promise.reject(err)
    )));
  it('should fail when no settings.auth does not have targetBranch', () => Promise
    .resolve()
    .then(() => validateServiceSettings({
      auth: { username: 'USERNAME', password: 'PASSWORD' },
    }))
    .then(() => Promise.reject(new Error('PASSED')))
    .catch(err => (
      err instanceof ServiceError.ServiceParamsAuthInvalid
        ? Promise.resolve()
        : Promise.reject(err)
    )));
  it('should be OK when OK', () => Promise
    .resolve()
    .then(() => validateServiceSettings({
      auth: { username: 'USERNAME', password: 'PASSWORD', targetBranch: 'BRANCH' },
    })));
});
