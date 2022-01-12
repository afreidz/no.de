import { ipc } from '$lib/socket';
import { writable } from 'svelte/store';

export const ws = writable([]);
export const screens = writable([]);

ipc.on('wm', data => {
  if (data.msg === 'update') {
    ws.update(() => (data.workspaces));
    screens.update(() => (data.screens));
  }
});

ipc.send('wm', { msg: 'query' });

