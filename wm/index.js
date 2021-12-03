#!/usr/bin/env node
const yargs = require('yargs/yargs');
const Manager = require('./src/manager');
const { hideBin } = require('yargs/helpers');
const { argv } = yargs(hideBin(process.argv));

(async () => {
  const manager = await (new Manager({ id: argv.id }));

  manager.addWorkspace(0);
  manager.addWorkspace(0);
  manager.addWorkspace(0);
  manager.addWorkspace(1);
  manager.addWorkspace(1);
  manager.addWorkspace(1);
  manager.activateWorkspace(0);
  manager.activateWorkspace(3);
})();