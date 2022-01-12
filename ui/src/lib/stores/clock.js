import { writable } from 'svelte/store';

export const time = writable(new Date());

setInterval(() => {
  time.update(t => new Date());
}, 1000);
