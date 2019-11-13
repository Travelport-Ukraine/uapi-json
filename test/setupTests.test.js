const sinon = require('sinon');

before(() => {
  // used to reduce noise in `npm test` output
  sinon.stub(console, 'log');
});

afterEach(() => console.log.resetHistory());
