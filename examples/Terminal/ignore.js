const uAPI = require('../../index');
const testConfig = require('../../test/testconfig');

const config = {
  ...testConfig,
  emulatePcc: '7J8J',
};

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
