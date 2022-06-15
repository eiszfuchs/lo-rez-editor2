import { writable } from 'svelte/store';

export default (defaultName, persistenceName) => {
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
