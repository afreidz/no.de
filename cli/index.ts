#!/usr/bin/env node
import yargs from 'yargs';
import { join } from 'path';
import { hideBin } from 'yargs/helpers';
import { start, stop } from './src/pm2';
import { spawn, exec } from 'child_process';
import IPCClient from '@no.de/ipc/src/client';

const uiurls = {
  desktop: 'http://localhost:7000/desktop',
  brain: 'http://localhost:7000/brain',
};

const display = 2;

yargs(hideBin(process.argv))
  .command('init', 'start supporting procs', init)
  .command('kill', 'kill running support procs', stopAll)
  .command('flush', 'flush logs', flush)
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
          "toggle-workspaces",
          "moveto-workspace",
          "cycle-workspace",
          "add-workspace",
          "toggle-float",
          "toggle-brain",
          "move-within",
          "split-off",
          "split-on",
          "resize",
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

function flush() {
  const names = [
    "no.de-ui",
    "no.de-wm",
    "no.de-ipc",
    "no.de-hkd",
    "no.de-brain",
    "no.de-desktop",
    "no.de-compositor",
  ];

  names.forEach(n => {
    spawn('npx', ['pm2', 'flush', n], {
      stdio: 'inherit',
      cwd: join(__dirname, '../')
    });
  });
}

function logs(e) {
  spawn('npx', ['pm2', ...e.argv._], {
    stdio: 'inherit',
    cwd: join(__dirname, '../'),
  });
}

function list() {
  spawn('npx', ['pm2', 'ls'], {
    stdio: 'inherit',
    cwd: join(__dirname, '../')
  });
}

async function stopAll() {
  await stop('no.de-wm');
  await stop('no.de-ipc');
  await stop('no.de-hkd');
  await stop('no.de-compositor');
}

async function init() {
  const base = join(__dirname, '../../build/');
  
  await start({
    name: 'no.de-wm',
    autorestart: false,
    cwd: join(base, '../'),
    script: `startx ${join(base, '../startwm.sh')} -- :${display}`,

  });

  await start({
    name: 'no.de-ipc',
    env: { PORT: 7001 },
    cwd: join(base, '/ipc'),
    script: 'node ./index.js',
  });

  await new Promise(r => setTimeout(r, 1800));

  //await start({
  //  cwd: join(base, '..'),
  //  name: 'no.de-compositor',
  //  env: { DISPLAY: `:${display}` },
  //  script: 'picom --config ./picom --experimental-backends',
  //});

  await start({
    name: 'no.de-hkd',
    cwd: join(base, '..'),
    env: { DISPLAY: `:${display}` },
    script: `/usr/bin/sxhkd -c sxhkdrc`,
  });
}

async function handleWMCMD(cmd) {
  const client = new IPCClient(['wm']);
  const { command, args } = cmd;
  client.send('wm', { msg: 'command', command, args });
}
