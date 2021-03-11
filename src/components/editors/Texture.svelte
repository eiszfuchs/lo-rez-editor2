<script>
    import { Button, Modal } from 'carbon-components-svelte';
    import Pen16 from 'carbon-icons-svelte/lib/Pen16';
    import Eyedropper16 from 'carbon-icons-svelte/lib/Eyedropper16';
    import TextFill16 from 'carbon-icons-svelte/lib/TextFill16';
    import Shuffle16 from 'carbon-icons-svelte/lib/Shuffle16';
    import CenterCircle16 from 'carbon-icons-svelte/lib/CenterCircle16';
    import Move16 from 'carbon-icons-svelte/lib/Move16';
    import Save16 from 'carbon-icons-svelte/lib/Save16';

    import Canvas, {
        TOOL_PEN,
        TOOL_FILL,
        TOOL_PICK,
        TOOL_SWAP,
        TOOL_REPLACE,
        TOOL_MOVE,
    } from '../atoms/PixelCanvas.svelte';

    import PalettePicker from '../atoms/PalettePicker.svelte';
    import CompareSwitcher from '../atoms/CompareSwitcher.svelte';
    import ComparePanel from '../atoms/ComparePanel.svelte';

    import { selectedVersion } from '@/stores/mc-versions.js';
    import { palettes, textures, versions } from '@/stores/project.js';
    import { extract, paint } from '@/modules/extractor.js';
    import { flatten, empty, wrap } from '@/modules/texture.js';
    import { lt } from '@/modules/version.js';

    export let zipEntry;
    export let active = false;

    let issues = [];
    let issueModalOpen = false;

    let texturePalette = null;
    let texture = [];
    let texturePicker;
    let textureTool = TOOL_PEN;

    const dataUriPrefix = 'data:image/png;base64,';

    $: zipContent = zipEntry?.getData().toString('binary');
    $: previewSrc = dataUriPrefix + btoa(zipContent || '');
    $: loPreviewSrc = paint(texture, texturePalette);

    function init() {
        issues = [];

        extract(previewSrc, ({ width, height, palette, getAt }) => {
            texturePalette = palette;
            texturePicker = getAt;

            const savedFlatTexture = textures.get(zipEntry.entryName);
            const savedPalette = palettes.get(zipEntry.entryName);

            if (savedFlatTexture) {
                console.debug(
                    'Check version:',
                    versions.get(zipEntry.entryName),
                    '>=',
                    $selectedVersion
                );

                console.debug(
                    'Check palette:',
                    Math.max(...savedFlatTexture),
                    '<',
                    palette.colors.size
                );

                if (lt(versions.get(zipEntry.entryName), $selectedVersion)) {
                    issues.push(
                        'This texture was sampled using an older Minecraft version.'
                    );
                }

                if (Math.max(...savedFlatTexture) >= palette.colors.size) {
                    issues.push(
                        'The saved version of this texture uses more colors than the palette provides.'
                    );
                }

                if (!savedPalette) {
                    issues.push(
                        'Issues cannot be recovered automatically as this texture was saved in an older version of lo-rez-editor.'
                    );
                } else if (
                    savedPalette.join(':') !==
                    texturePalette.toArray().join(':')
                ) {
                    issues.push(
                        'The color palette has changed since this texture was saved.'
                    );
                }

                issueModalOpen = issues.length > 0;
                texture = wrap(savedFlatTexture, width / 2);
            } else {
                texture = empty(width / 2, height / 2, palette.getDefault());
            }

            issues = issues;
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

    function onSave() {
        const name = zipEntry.entryName;

        versions.set(name, $selectedVersion);
        palettes.set(name, texturePalette.toArray());
        textures.set(name, flatten(texture));
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
                                on:change={() => (texture = texture)}
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
                    disabled
                    kind={textureTool === TOOL_PICK ? 'secondary' : 'ghost'}
                    on:click={() => (textureTool = TOOL_PICK)}
                    size="small"
                    iconDescription="Pick"
                    icon={Eyedropper16}
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
            </div>

            <div class="tool-group">
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

            <div class="tool-group">
                <Button
                    kind={textureTool === TOOL_MOVE ? 'secondary' : 'ghost'}
                    on:click={() => (textureTool = TOOL_MOVE)}
                    size="small"
                    iconDescription="Move"
                    icon={Move16}
                    tooltipPosition="left"
                />
            </div>
        </div>
    </div>

    <div>
        <PalettePicker palette={texturePalette} highlight={highlightPalette} />
    </div>

    <div class="layout-box texture-previews">
        <div>
            <CompareSwitcher>
                <ComparePanel label="Original">
                    <div class="texture-preview-parent">
                        <div
                            class="texture-preview"
                            style="background-image: url({previewSrc});"
                        />
                    </div>
                </ComparePanel>
            </CompareSwitcher>
        </div>

        <div>
            <CompareSwitcher>
                <ComparePanel label="Editor">
                    <div class="texture-preview-parent">
                        <div
                            class="texture-preview"
                            style="background-image: url({loPreviewSrc});"
                        />
                    </div>
                </ComparePanel>
            </CompareSwitcher>
        </div>
    </div>

    <div class="actions">
        <Button kind="primary" size="field" icon={Save16} on:click={onSave}>
            Save
        </Button>
    </div>

    <Modal
        preventCloseOnClickOutside
        open={issueModalOpen}
        size="sm"
        modalHeading="Fix issues with texture"
        primaryButtonText="Apply changes"
        secondaryButtonText="Dismiss"
        primaryButtonDisabled
        on:click:button--secondary={() => (issueModalOpen = false)}
    >
        {#each issues as issue}
            <p class="issue">{issue}</p>
        {/each}
    </Modal>
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

    .texture-previews {
        flex: 1 1 auto;
    }

    .texture-parent {
        display: flex;

        padding: var(--cds-spacing-03);

        > * {
            margin: auto;

            width: 16px * 12;
            height: 16px * 12;
        }
    }

    .texture-preview-parent {
        position: absolute;
        top: var(--cds-spacing-03);
        left: var(--cds-spacing-03);
        right: var(--cds-spacing-03);
        bottom: var(--cds-spacing-03);

        background-image: var(--tex-transparent-background);
        background-position: center;
    }

    .texture-preview {
        height: 100%;

        image-rendering: pixelated;
        background-size: 64px;
        background-position: center;
    }

    .tools {
        flex-grow: 0;
        flex-basis: 32px;
        margin-top: 20px;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .tool-group {
        background-color: var(--cds-field-01);
    }

    .actions {
        margin-top: auto;
        align-self: flex-end;
    }

    .issue {
        color: var(--cds-text-error);
    }
</style>
