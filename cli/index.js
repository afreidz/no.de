#!/usr/bin/env node
const chalk = require('chalk');
const { join } = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const IPCClient = require('no.de-ipc/client');
const { start, stop, disconnect } = require('./src/pm2.js');

yargs(hideBin(process.argv))
  .command('init', 'start supporting procs', init)
  .command('kill', 'kill running support procs', stopAll)
  .command({
    command: 'wm [command] [args]',
    describe: 'Issues a window manager [command] with [args]',
    alias: 'window-manager',
    handler: handleWMCMD,
    builder: {
      command: {
        alias: 'c',
        demand: true,
        choices: [
          "activate-workspace",
          "change-horizontal",
          "change-vertical",
          "add-workspace",
          "toggle-split",
          "toggle-float",
          "exec",
          "flip",
        ],
      },
      args: {
        alias: 'a',
        array: true,
        demand: false,
      }
    }
  })
  .help('h')
  .parse();

async function stopAll() {
  await stop('ui');
  await stop('ipc');
}

async function init() {
  await stopAll();
  await start({
    name: 'ui',
    script: 'npm start',
    env: { PORT: 7000 },
    cwd: join(__dirname, '../ui'),
  });
  await start({
    name: 'ipc',
    script: 'npm start',
    env: { PORT: 7001 },
    cwd: join(__dirname, '../ipc'),
  });
}

async function handleWMCMD(cmd) {
  const client = new IPCClient(['wm']);
  const { command, args } = cmd;

  client.send('wm', { msg: 'command', command, args });

  await new Promise(r => setTimeout(r, 1000));
  client.close();
}