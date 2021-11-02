#!/usr/bin/env node
const ioHook = require('iohook');
const Manager = require('./lib/manager');

(async () => {
  const manager = await (new Manager());

  manager.addWorkspace(0);
  manager.addWorkspace(0);
  manager.addWorkspace(0);
  manager.addWorkspace(1);
  manager.addWorkspace(1);
  manager.addWorkspace(1);

  ioHook.on('keydown', e => {
    // console.log('Key ', e.keycode);
    if (e.keycode == 17 && e.metaKey) {
      manager.kill();
    }
    if (e.keycode == 28 && e.metaKey) {
      manager.exec('kitty');
    }
    if (e.keycode == 31 && e.metaKey) {
      manager.split = !manager.split;
    }
    if (e.keycode == 2 && e.metaKey) {
      manager.workspaces[0].active = true;
    }
    if (e.keycode == 3 && e.metaKey) {
      manager.workspaces[1].active = true;
    }
    if (e.keycode == 4 && e.metaKey) {
      manager.workspaces[2].active = true;
    }
    if (e.keycode == 5 && e.metaKey) {
      manager.workspaces[3].active = true;
    }
    if (e.keycode == 6 && e.metaKey) {
      manager.workspaces[4].active = true;
    }
    if (e.keycode == 7 && e.metaKey) {
      manager.workspaces[5].active = true;
    }
  });
  ioHook.start();

})();