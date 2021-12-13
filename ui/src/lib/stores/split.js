import { ipc } from '$lib/socket';
import { writable } from 'svelte/store';

const split = writable(false);

ipc.on('wm', data => {
  if (data.message !== 'split') return;
  split.update(() => (data.split));
});

ipc.send('wm', { msg: 'query', type: 'split' });

export default split;