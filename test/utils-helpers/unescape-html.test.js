const { expect } = require('chai');
const unescapeHtml = require('../../src/utils/unescape-html');

describe('#unescapeHtml', () => {
  it('should properly transform lt, newline and gt', () => {
    const source = 'UNABLE TO RETRIEVE - RESTRICTED BF   \n&gt;&lt;';
    expect(unescapeHtml(source)).to.be.eq('UNABLE TO RETRIEVE - RESTRICTED BF   \n><');
  });

  it('should properly transform quot', () => {
    const source = 'sumtest &quot;';
    expect(unescapeHtml(source)).to.be.eq('sumtest "');
  });

  it('should properly transform nbsp', () => {
    const source = 'some text&nbsp;';
    expect(unescapeHtml(source)).to.be.eq('some text ');
  });

  it('should not change original string', () => {
    const source = 'UNABLE TO RETRIEVE - RESTRICTED BFgt;lt;';
    expect(unescapeHtml(source)).to.be.eq('UNABLE TO RETRIEVE - RESTRICTED BFgt;lt;');
  });
});
