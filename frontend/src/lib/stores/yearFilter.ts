import { writable } from 'svelte/store';

// null = all years
export const yearFilter = writable<number | null>(new Date().getFullYear());
