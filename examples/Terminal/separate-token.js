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
  autoClose: false,
});


TerminalService.getToken()
  .then((token) => {
    const newTerminalService = uAPI.createTerminalService({
      auth: Object.assign({}, config, { token }),
      debug: 2,
      production: true,
    });

    return Promise.all([
      newTerminalService.executeCommand('I')
        .then(() => newTerminalService.closeSession()),
    ]);
  });
