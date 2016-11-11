const uAPI = require('../../index');
const config = require('../../test/testconfig');

const TerminalService = uAPI.createTerminalService({
  auth: config,
  debug: 2,
  production: true,
  emulatePcc: '7j8j',
});

// BAD EXAMPLE OF USAGE
// Terminal session should be closed

TerminalService.executeCommand('I')
  .then(console.log)
  .catch((err) => {
    console.error(err);
  });
