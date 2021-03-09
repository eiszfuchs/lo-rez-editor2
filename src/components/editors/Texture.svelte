<script>
    import { Button } from 'carbon-components-svelte';
    import Pen16 from 'carbon-icons-svelte/lib/Pen16';
    import Eyedropper16 from 'carbon-icons-svelte/lib/Eyedropper16';
    import TextFill16 from 'carbon-icons-svelte/lib/TextFill16';
    import Shuffle16 from 'carbon-icons-svelte/lib/Shuffle16';
    import CenterCircle16 from 'carbon-icons-svelte/lib/CenterCircle16';
    import Save16 from 'carbon-icons-svelte/lib/Save16';

    import Canvas, {
        TOOL_PEN,
        TOOL_FILL,
        TOOL_PICK,
        TOOL_SWAP,
        TOOL_REPLACE,
    } from '../atoms/PixelCanvas.svelte';

    import PalettePicker from '../atoms/PalettePicker.svelte';
    import CompareSwitcher from '../atoms/CompareSwitcher.svelte';
    import ComparePanel from '../atoms/ComparePanel.svelte';

    import { textures } from '@/stores/project.js';
    import { extract } from '../../modules/extractor';
    import { empty, wrap } from '@/modules/texture.js';

    export let zipEntry;
    export let active = false;

    let texturePalette = null;
    let texture = [];
    let texturePicker;
    let textureTool = TOOL_PEN;

    const dataUriPrefix = 'data:image/png;base64,';

    $: zipContent = zipEntry?.getData().toString('binary');
    $: previewSrc = dataUriPrefix + btoa(zipContent || '');

    function init() {
        extract(previewSrc, ({ width, height, palette, getAt }) => {
            texturePalette = palette;
            texturePicker = getAt;

            if (textures.has(zipEntry.entryName)) {
                texture = wrap(textures.get(zipEntry.entryName), width / 2);
            } else {
                texture = empty(width / 2, height / 2, palette.getDefault());
            }
        });
    }

    // Init like this to prevent re-load when another editor is opened
    $: init(previewSrc);

    const posFromEvent = (event) => [
        Math.floor(event.offsetX / 12),
        Math.floor(event.offsetY / 12),
    ];

    let highlightPalette = [];

    function leaveOriginal() {
        highlightPalette = [];
    }

    function overOriginal(event) {
        const [pixelX, pixelY] = posFromEvent(event);

        highlightPalette = [texturePicker(pixelX, pixelY)];
        event.preventDefault();
    }

    function clickOriginal(event) {
        const [pixelX, pixelY] = posFromEvent(event);

        texturePalette.setColor(texturePicker(pixelX, pixelY));
    }
</script>

<div class="editor" class:active>
    <div class="layout-box">
        <div>
            <CompareSwitcher>
                <ComparePanel label="Original">
                    <div class="texture-parent">
                        <img
                            alt=""
                            src={previewSrc}
                            on:mousemove={overOriginal}
                            on:mouseleave={leaveOriginal}
                            on:click={clickOriginal}
                        />
                    </div>
                </ComparePanel>
            </CompareSwitcher>
        </div>

        <div>
            <CompareSwitcher>
                <ComparePanel label="Editor">
                    <div class="texture-parent">
                        <div>
                            <Canvas
                                {texture}
                                tool={textureTool}
                                palette={texturePalette}
                            />
                        </div>
                    </div>
                </ComparePanel>

                <ComparePanel label="Exported">
                    <div class="texture-parent">
                        <img src="../lo-rez/{zipEntry.entryName}" alt="" />
                    </div>
                </ComparePanel>
            </CompareSwitcher>
        </div>

        <div class="tools">
            <div class="tool-group">
                <Button
                    kind={textureTool === TOOL_PEN ? 'secondary' : 'ghost'}
                    on:click={() => (textureTool = TOOL_PEN)}
                    size="small"
                    iconDescription="Pen"
                    icon={Pen16}
                    tooltipPosition="left"
                />

                <Button
                    kind={textureTool === TOOL_FILL ? 'secondary' : 'ghost'}
                    on:click={() => (textureTool = TOOL_FILL)}
                    size="small"
                    iconDescription="Fill"
                    icon={TextFill16}
                    tooltipPosition="left"
                />

                <Button
                    disabled
                    kind={textureTool === TOOL_PICK ? 'secondary' : 'ghost'}
                    on:click={() => (textureTool = TOOL_PICK)}
                    size="small"
                    iconDescription="Pick"
                    icon={Eyedropper16}
                    tooltipPosition="left"
                />

                <Button
                    disabled
                    kind={textureTool === TOOL_SWAP ? 'secondary' : 'ghost'}
                    on:click={() => (textureTool = TOOL_SWAP)}
                    size="small"
                    iconDescription="Swap"
                    icon={Shuffle16}
                    tooltipPosition="left"
                />

                <Button
                    kind={textureTool === TOOL_REPLACE ? 'secondary' : 'ghost'}
                    on:click={() => (textureTool = TOOL_REPLACE)}
                    size="small"
                    iconDescription="Replace"
                    icon={CenterCircle16}
                    tooltipPosition="left"
                />
            </div>
        </div>
    </div>

    <div>
        <PalettePicker palette={texturePalette} highlight={highlightPalette} />
    </div>

    <div class="actions">
        <Button disabled kind="primary" size="field" icon={Save16}>Save</Button>
    </div>
</div>

<style lang="scss">
    .editor {
        display: flex;
        flex-direction: column;
        gap: var(--cds-spacing-02);

        min-height: 100%;

        &:not(.active) {
            display: none;
        }
    }

    img {
        image-rendering: pixelated;
        background-image: var(--tex-transparent-background);
    }

    .layout-box {
        display: flex;
        flex-direction: row;
        gap: var(--cds-spacing-02);

        > * {
            flex: 1 1 1%;
            min-width: 1px;
        }
    }

    .texture-parent {
        display: flex;

        padding: var(--cds-spacing-04);

        > * {
            margin: auto;

            width: 16px * 12;
            height: 16px * 12;
        }
    }

    .tools {
        flex-grow: 0;
        flex-basis: 40px;

        margin-top: 20px;
        padding: var(--cds-spacing-02);
        background-color: var(--cds-field-01);
    }

    .actions {
        margin-top: auto;
        align-self: flex-end;
    }
</style>
