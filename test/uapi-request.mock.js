const sinon = require('sinon');
const { expect } = require('chai');

const r = params => sinon.spy((url,
  auth,
  template,
  root,
  validator,
  error,
  parser,
  debug) => {
  expect(url.match(/.*.pp.*/)).to.be.equal(null);
  expect(auth).to.be.equal(params.auth);
  expect(template).to.be.a('string');
  expect(validator).to.be.a('function');
  expect(parser).to.be.a('function');
  expect(error).to.be.a('function');
  expect(debug).to.be.equal(params.debug);
});

module.exports = r;
