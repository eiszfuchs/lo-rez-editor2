import { writable } from 'svelte/store';

export const TRANSPARENT_FOLLOW = 'follow';
export const TRANSPARENT_BRIGHT = 'bright';
export const TRANSPARENT_DARK = 'dark';
export const TRANSPARENT_WHITE = 'white';
export const TRANSPARENT_BLACK = 'black';
export const TRANSPARENT_FUCHSIA = 'fuchsia';

const persistentWritable = (defaultName, persistenceName) => {
    let initialValue = defaultName;
    const storedValue = localStorage.getItem(persistenceName);

    if (storedValue) {
        initialValue = JSON.parse(storedValue);
    }

    const store = writable(initialValue);

    store.subscribe((newValue) => {
        localStorage.setItem(persistenceName, JSON.stringify(newValue));
    });

    return store;
};

export const closeOnSave = persistentWritable(false, 'settings.close_on_save');

export const transparentBackground = persistentWritable(
    TRANSPARENT_FOLLOW,
    'settings.transparent_background'
);
