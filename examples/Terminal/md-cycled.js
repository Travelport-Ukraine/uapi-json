const uAPI = require('../../index');
const testConfig = require('../../test/testconfig');

const config = {
  ...testConfig,
};

const TerminalService = uAPI.createTerminalService({
  auth: config,
  debug: 0,
  production: true,
});

(async () => {
  try {
    await TerminalService.executeCommand('*128PX1');
    const hff = await TerminalService.executeCommand('*HFF');

    console.log(hff);
    TerminalService.closeSession();
  } catch (e) {
    console.log(e);
    TerminalService.closeSession();
  }
})();
