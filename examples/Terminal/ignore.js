const uAPI = require('../../index');
const testConfig = require('../../test/testconfig');

const config = Object.assign({}, testConfig, {
  emulatePcc: '7j8j',
});

const TerminalService = uAPI.createTerminalService({
  auth: config,
  debug: 2,
  production: true,
});

// BAD EXAMPLE OF USAGE
// Terminal session should be closed

TerminalService.executeCommand('I')
  .then(console.log)
  .catch((err) => {
    console.error(err);
  });
