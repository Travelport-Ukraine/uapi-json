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
// Sending commands simulataneously not allowed

TerminalService.executeCommand('I')
  .then((res) => {
    console.log(res);
  })
  .then(
    () => TerminalService.closeSession()
  )
  .catch((err) => {
    console.error(err);
  });

// This call will return error
TerminalService.executeCommand('I')
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    // err = TerminalRuntimeError.TerminalIsBusy
    console.error(err);
  });
