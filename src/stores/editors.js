import { writable, get } from 'svelte/store';
import { clamp } from '../modules/math';

export const editors = writable([]);

export const activeEditor = writable(null);

export const openEditor = (editor) => {
    const alreadyOpen = get(editors).find(
        ({ zipEntry }) => zipEntry === editor.zipEntry
    );

    if (!alreadyOpen) {
        editors.update((l) => [...l, editor]);
        activeEditor.set(editor);
    } else {
        activeEditor.set(alreadyOpen);
    }
};

export const closeEditor = (editor) => {
    const previousIndex = get(editors).indexOf(editor);
    editors.update((l) => l.filter((e) => e !== editor));

    const editorList = get(editors);
    if (editorList.length > 0) {
        const newIndex = clamp(previousIndex, 0, editorList.length - 1);

        activeEditor.set(editorList[newIndex]);
    } else {
        activeEditor.set(null);
    }
};
