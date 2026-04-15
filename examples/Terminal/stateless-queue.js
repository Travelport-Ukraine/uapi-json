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

const statelessCommands = [
  '.CDIEV',
  '.CDPAR',
  '.CDBRU',
];

Promise
  .all(
    statelessCommands.map(
      (command) => TerminalService.executeStatelessCommandWhenIdle(command, {
        sleepInterval: 1000,
      })
    )
  )
  .then((responses) => {
    responses.forEach((response) => console.log(response));
  })
  .then(
    () => TerminalService.closeSession()
  )
  .catch((err) => {
    console.error(err);
  });
