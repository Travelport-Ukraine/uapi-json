const uAPI = require('.');
const async = require('async');
var count = 1;
var good = 0;
var bad = 0;
var i;

const timer = `Run ${count} times`;
console.time(timer);

var run = function (callback) {
  const terminalService = uAPI.createTerminalService({
    auth: {
      username: 'Universal API/uAPI2398058536-5adfe7ca',
      password: 'Bk6{_2HwnW',
      targetBranch: 'P7049421',
    },
    production: false,
    debug: 0,
    timeout: 2000,
    emulatePcc: '7J8J',
  });

  terminalService.executeCommand('FSNYC21FEBLAX')
  .then((response) => {
    console.log(response);
  })
  .then(() => terminalService.executeCommand('FSMORE'))
  .then((response) => {
    console.log(response);
  })
  .then(() => terminalService.executeCommand('FSMORE'))
  .then((response) => {
    console.log(response);
  })
  .then(() => terminalService.closeSession())
  .then(() => {
    good += 1;
    callback();
  })
  .catch((err) => {
    bad += 1;
    console.error(err);
    callback();
  });
};

var runs = [];

for (var i=0; i<count; i++) {
  runs.push(run);
}

async.parallel(runs, () => {
  console.log(`Good: ${good}, bad: ${bad}`);
  console.timeEnd(timer);
});
