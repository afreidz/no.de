import { writable } from 'svelte/store';

export const ws = writable([]);
export const screens = writable([]);
export const root = writable({ x: null, y: null, w: null, h: null });
