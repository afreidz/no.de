#!/usr/bin/env node
const Manager = require('./src/manager');

(async () => {
  const manager = await (new Manager());

  manager.addWorkspace(0);
  manager.addWorkspace(1);
  manager.activateWorkspace(0);
  manager.activateWorkspace(1);
})();