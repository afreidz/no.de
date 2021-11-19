import { writable } from 'svelte/store';

export const time = writable(new Date());

setTimeout(() => {
  time.update(t => new Date());
}, 1000);