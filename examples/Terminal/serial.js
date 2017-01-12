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

TerminalService
  .executeCommand('I')
  .then(console.log)
  .then(
    () => TerminalService.executeCommand('.CDIEV')
  )
  .then(console.log)
  .then(
    () => TerminalService.executeCommand('.ADPS')
  )
  .then(console.log)
  .then(
    () => TerminalService.executeCommand('@LT')
  )
  .then(console.log)
  .then(
    () => TerminalService.closeSession()
  )
  .catch((err) => {
    console.error(err);
  });
