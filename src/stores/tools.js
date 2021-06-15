import { get, writable } from 'svelte/store';

// Texture tools
export const TOOL_PEN = 'pen';
export const TOOL_FILL = 'fill';
export const TOOL_PICK = 'pick';
export const TOOL_SWAP = 'swap';
export const TOOL_REPLACE = 'replace';
export const TOOL_MOVE = 'move';

const createActiveTextureTool = () => {
    const { subscribe, set } = writable('');
    const init = (tool = TOOL_PEN) => set(tool);

    return {
        subscribe,
        init,
        set: (toTool = '', ignoreTools = []) => {
            const currentTextureTool = get(activeTextureTool);
            const ignoreToolsMatch = ignoreTools.some(
                (tool) => tool === currentTextureTool
            );

            if (ignoreToolsMatch) {
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
