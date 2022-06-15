import { get, writable } from 'svelte/store';
import { TOOL_PEN } from '@/consts/tools.js';

const createActiveTextureTool = () => {
    const { subscribe, set } = writable('');
    const init = (tool = TOOL_PEN) => set(tool);

    return {
        subscribe,
        init,
        set: (toTool = '', ignoreTools = []) => {
            const currentTextureTool = get(activeTextureTool);

            if (ignoreTools.includes(currentTextureTool)) {
                set(currentTextureTool);
            } else {
                set(toTool);
            }
        },
        reset: () => init(),
        unset: () => set(''),
    };
};

export const activeTextureTool = createActiveTextureTool();
