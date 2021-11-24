#!/usr/bin/env node
const chalk = require('chalk');
const { join } = require('path');
const yargs = require('yargs/yargs');
const { spawn } = require('child_process');
const { hideBin } = require('yargs/helpers');
const IPCClient = require('no.de-ipc/client');
const { start, stop, disconnect } = require('./src/pm2.js');

const uiurls = {
  desktop: 'http://localhost:7000/desktop',
};

yargs(hideBin(process.argv))
  .command('init', 'start supporting procs', init)
  .command('kill', 'kill running support procs', stopAll)
  .command('logs', 'display logs', logs)
  .command('ls', 'display logs', list)
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
          "kill",
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

function logs() {
  const log = spawn('npx', ['pm2', 'logs'], {
    stdio: 'inherit',
    cwd: join(__dirname, '../'),
  });
}

function list() {
  const list = spawn('npx', ['pm2', 'ls'], {
    stdio: 'inherit',
    cwd: join(__dirname, '../')
  });
}

async function stopAll() {
  await stop('no.de-ui');
  await stop('no.de-wm');
  await stop('no.de-ipc');
  await stop('no.de-hkd');
  await stop('no.de-desktop');
}

async function init() {
  const wmid = +new Date;

  await start({
    name: 'no.de-ui',
    script: 'npm start',
    env: { PORT: 7000 },
    cwd: join(__dirname, '../ui'),
  });

  await start({
    name: 'no.de-ipc',
    script: 'npm start',
    env: { PORT: 7001 },
    cwd: join(__dirname, '../ipc'),
  });

  await start({
    name: 'no.de-wm',
    autorestart: false,
    script: `startx ${join(__dirname, '../wm', 'index.js')} --id=${wmid} -- :2`,
  });

  await new Promise(r => setTimeout(r, 1000));

  await start({
    name: 'no.de-hkd',
    env: { DISPLAY: ':2' },
    cwd: join(__dirname, '../'),
    script: `/usr/bin/sxhkd -c sxhkdrc`,
  });

  await start({
    autorestart: false,
    name: 'no.de-desktop',
    env: { DISPLAY: ':2' },
    cwd: join(__dirname, '../ui/bin'),
    script: `./webview.cjs --title desktop_${wmid} --url ${uiurls['desktop']}`
  });
}

async function handleWMCMD(cmd) {
  const client = new IPCClient(['wm']);
  const { command, args } = cmd;

  client.send('wm', { msg: 'command', command, args });

  await new Promise(r => setTimeout(r, 1000));
  client.close();
}