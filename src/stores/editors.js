import { writable } from 'svelte/store';

export const editors = writable([]);

export const activeEditor = writable(null);

export const openEditor = (editor) => {
    editors.update((l) => [...l, editor]);
    activeEditor.set(editor);
};
