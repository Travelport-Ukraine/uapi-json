const uAPI = require('../../index');
const config = require('../../test/testconfig');

const TerminalService = uAPI.createTerminalService({
  auth: config,
  debug: 0,
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
