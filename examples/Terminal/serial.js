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
