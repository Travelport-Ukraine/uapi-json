const { expect } = require('chai');

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Parser = require('../src/Request/uapi-parser');
const errorsConfig = require('../src/Request/errors-config');
const defaultConfig = require('../src/Request/default-config');
const { errors } = require('../src');

const xmlFolder = path.join(__dirname, '/FakeResponses');

describe('uapi-parser tests', () => {
  it('parse with errors', () => {
    const parser = new Parser('someroot', 'v47_0');
    return parser.parseXML('adsdasds').then(() => {
      throw new Error('Error should be thrown');
    }, (err) => {
      assert(err instanceof errors.Request.RequestSoapError.SoapServerError);
    });
  });

  it('should detect error version automaticly', () => {
    const parser = new Parser('someroot', 'v47_0');
    const xml = fs.readFileSync(path.join(xmlFolder, '/Other/UnableToFareQuoteError.xml'));
    return parser.parse(xml).then(() => {
      assert(parser.uapi_version === 'v47_0', 'Version is not overrided');
    });
  });
});

describe('uapi-parser error handling tests', () => {
  it('trouble case at withVersionProp handling', () => {
    const parser = new Parser('someroot', 'v47_0');
    const xml = fs.readFileSync(path.join(xmlFolder, '/Other/validationErrorAddress.xml')).toString();
    return parser.parse(xml);
  });
});

describe('uapi-parser config functions tests', () => {
  it('check defaultConfig export', () => {
    assert(typeof defaultConfig === 'function');
    const config = defaultConfig('v_123_45');
    expect(config).to.have.all.keys(
      'noCollapseList',
      'fullCollapseListObj',
      'fullCollapseSingleKeyedObj',
      'CollapseKeysOnly',
      'dropKeys'
    );
  });

  it('check errorsConfig export', () => {
    assert(typeof errorsConfig === 'function');
    const config = errorsConfig('v_123_45');
    expect(config).to.have.all.keys(
      'noCollapseList',
      'fullCollapseListObj',
      'fullCollapseSingleKeyedObj',
      'CollapseKeysOnly',
      'dropKeys'
    );
  });
});
