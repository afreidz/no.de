import { ipc } from '$lib/socket';
import { writable } from 'svelte/store';

const ws = writable([]);

ipc.on('wm', data => {
  ws.update(() => (data.workspaces));
});

ipc.send('wm', { msg: 'query', type: 'workspaces' });

export default ws;