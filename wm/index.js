#!/usr/bin/env node
const ioHook = require('iohook');
const Manager = require('./src/manager');

(async () => {
  const manager = await (new Manager());

  manager.addWorkspace(0);
  manager.addWorkspace(0);
  manager.addWorkspace(0);
  manager.addWorkspace(0);
  manager.addWorkspace(1);
  manager.addWorkspace(1);
  manager.addWorkspace(1);
  manager.addWorkspace(1);
  manager.activateWorkspace(0);
  manager.activateWorkspace(4);

  ioHook.on('keydown', e => {
    // console.log('Key ', e.keycode);

    // Manager
    if (e.keycode == 31 && e.metaKey && !e.shiftKey) {
      manager.split = !manager.split;
    }
    if (e.keycode == 31 && e.metaKey && e.shiftKey) {
      manager.flip();
    }
    if (e.keycode == 17 && e.metaKey) {
      manager.kill();
    }

    // Apps
    if (e.keycode == 28 && e.metaKey) { //cmd+enter
      manager.exec('kitty');
    }
    if (e.keycode == 48 && e.metaKey) { //cmd+b
      manager.exec('brave');
    }
    if (e.keycode == 21 && e.metaKey) { //cmd+d
      manager.exec('discord');
    }
    // if (e.keycode == 31 && e.metaKey) { //cmd+s
    //   manager.exec('slack');
    // }
    if (e.keycode == 20 && e.metaKey) { //cmd+t
      manager.exec('teams');
    }
    if (e.keycode == 33 && e.metaKey && !e.shiftKey) { //cmd+f
      manager.exec('nautilus');
    }
    if (e.keycode == 46 && e.metaKey) { //cmd+c
      manager.exec('codium');
    }
    if (e.keycode == 24 && e.metaKey) { //cmd+o
      manager.exec('prospect-mail');
    }


    // Workspaces
    if (e.keycode == 2 && e.metaKey) {
      manager.activateWorkspace(0);
    }
    if (e.keycode == 3 && e.metaKey) {
      manager.activateWorkspace(1);
    }
    if (e.keycode == 4 && e.metaKey) {
      manager.activateWorkspace(2);
    }
    if (e.keycode == 5 && e.metaKey) {
      manager.activateWorkspace(3);
    }
    if (e.keycode == 6 && e.metaKey) {
      manager.activateWorkspace(4);
    }
    if (e.keycode == 7 && e.metaKey) {
      manager.activateWorkspace(5);
    }
    if (e.keycode == 8 && e.metaKey) {
      manager.activateWorkspace(6);
    }
    if (e.keycode == 9 && e.metaKey) {
      manager.activateWorkspace(7);
    }

    // Resize
    if (e.keycode == 57416 && e.metaKey) {
      manager.changeVertical(5);
    }
    if (e.keycode == 57424 && e.metaKey) {
      manager.changeVertical(-5);
    }
    if (e.keycode == 57419 && e.metaKey) {
      manager.changeHorizontal(-5);
    }
    if (e.keycode == 57421 && e.metaKey) {
      manager.changeHorizontal(5);
    }
    if (e.keycode == 33 && e.metaKey && e.shiftKey) { //cmd+f
      manager.toggleFloat();
    }
  });
  ioHook.start();

})();