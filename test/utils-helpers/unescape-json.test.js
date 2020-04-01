const { expect } = require('chai');
const unescapeJson = require('../../src/utils/unescape-json');

describe('#unescapeJSON', () => {
  it('should properly transform JSON', () => {
    const source = {
      faultcode: [
        'Server.Security',
      ],
      faultstring: [
        'UNABLE TO RETRIEVE - RESTRICTED BF   \n&gt;&lt;',
      ],
    };

    const transformed = unescapeJson(source);
    expect(transformed.faultstring[0]).to.be.eq('UNABLE TO RETRIEVE - RESTRICTED BF   \n><');
  });
});
