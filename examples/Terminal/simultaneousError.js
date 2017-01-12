const uAPI = require('../../index');
const testConfig = require('../../test/testconfig');

const config = Object.assign({}, testConfig, {
  emulatePcc: '7j8j',
});

const TerminalService = uAPI.createTerminalService({
  auth: config,
  debug: 2,
  production: true,
  emulatePcc: '7j8j',
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
