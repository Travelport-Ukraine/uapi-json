#!/usr/bin/env node

const readline = require('readline2');
const prefix = '>';
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

const rl = readline.createInterface(process.stdin, process.stdout);

const prompt = () => {
  rl.setPrompt(prefix, prefix.length);
  rl.prompt();
};

prompt();
rl.on('line', (line) => {
  // TerminalService doesn't accept empty commands
  if (!line) {
    console.log('CHECK ACTION CODE');
    prompt();
    return;
  }

  rl.pause();
  TerminalService
    .executeCommand(line)
    .then((reply) => {
      process.stdout.write(reply.slice(0, -1));
    })
    .then(() => {
      rl.resume();
    }).catch((err) => {
      console.error(err);
    });
}).on('close', () => {
  console.log('Disconnecting');
  TerminalService.closeSession()
    .then(() => {
      process.exit(0);
    });
});
