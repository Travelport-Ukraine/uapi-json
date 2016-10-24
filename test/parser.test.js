const assert = require('assert');
const errors = require('../src').errors;
const UAPIParser = require('../src/Request/uapi-parser');

const parser = new UAPIParser('v_36_0', {});

describe('parser tests', () => {
  it('parse with errors', () => (
    parser.parseXML('adsdasds').then(() => {
      throw new Error('Error should be thrown');
    }, (err) => {
      assert(err instanceof errors.Request.RequestSoapError.SoapServerError);
    })
  ));
});
