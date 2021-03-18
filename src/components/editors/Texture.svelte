<script context="module">
    export const FIX_AUTO = 'auto';
    export const FIX_LEGACY = 'legacy';

    export const PASTE_INDICES = 'indices';
    export const PASTE_COLORS = 'colors';
</script>

<script>
    import { createEventDispatcher } from 'svelte';

    import { Button, Modal, Checkbox } from 'carbon-components-svelte';
    import Pen16 from 'carbon-icons-svelte/lib/Pen16';
    import Eyedropper16 from 'carbon-icons-svelte/lib/Eyedropper16';
    import TextFill16 from 'carbon-icons-svelte/lib/TextFill16';
    import Shuffle16 from 'carbon-icons-svelte/lib/Shuffle16';
    import CenterCircle16 from 'carbon-icons-svelte/lib/CenterCircle16';
    import Move16 from 'carbon-icons-svelte/lib/Move16';
    import Paste16 from 'carbon-icons-svelte/lib/Paste16';
    import Copy16 from 'carbon-icons-svelte/lib/Copy16';
    import Save16 from 'carbon-icons-svelte/lib/Save16';

    import Canvas, {
        TOOL_PEN,
        TOOL_FILL,
        TOOL_PICK,
        TOOL_SWAP,
        TOOL_REPLACE,
        TOOL_MOVE,
    } from '../atoms/PixelCanvas.svelte';

    import Preview from '../atoms/PixelPreview.svelte';
    import PalettePicker from '../atoms/PalettePicker.svelte';
    import PalettePreview from '../atoms/PalettePreview.svelte';
    import CompareSwitcher from '../atoms/CompareSwitcher.svelte';
    import ComparePanel from '../atoms/ComparePanel.svelte';

    import {
        cachedVersions,
        downloadedVersions,
        selectedVersion,
    } from '@/stores/mc-versions.js';

    import { drafts, palettes, textures, versions } from '@/stores/project.js';
    import { textureClipboard } from '@/stores/clipboard.js';
    import { closeOnSave } from '@/stores/settings.js';

    import { extract, paint } from '@/modules/extractor.js';
    import { flatten, empty, wrap } from '@/modules/texture.js';
    import { checkAsset } from '@/modules/issues.js';
    import { lt } from '@/modules/version.js';

    export let zipEntry;
    export let active = false;

    let issues = [];
    let changes = {};
    let isDraft = false;
    let issueModalOpen = false;
    let fixedTexture = [];
    let fromLegacyTexture = [];
    let savedPalette = [];
    let fixMode = null;

    let pasteRawTexture = null;
    let pasteColorTexture = null;
    let pasteColors = null;
    let pasteModalOpen = false;
    let pasteMode = null;

    let texturePalette = null;
    let texture = [];
    let texturePicker;
    let textureTool = TOOL_PEN;

    const dispatch = createEventDispatcher();

    const dataUriPrefix = 'data:image/png;base64,';

    const dataToUri = (data) =>
        !data ? null : dataUriPrefix + btoa(data.toString('binary') || '');

    $: entryName = zipEntry?.entryName;
    $: previewSrc = dataToUri(zipEntry?.getData());
    $: loPreviewSrc = paint(texture, texturePalette);
    $: epPreviewSrc = `../lo-rez/${entryName}`;

    function init() {
        changes = {};

        isDraft = drafts.get(entryName, false);

        extract(previewSrc, ({ width, height, palette, getAt }) => {
            texturePalette = palette;
            texturePicker = getAt;

            const savedFlatTexture = textures.get(entryName);
            if (savedFlatTexture) {
                issues = checkAsset($selectedVersion, entryName, palette);
                issueModalOpen = issues.length > 0;

                fixMode = null;
                fixedTexture = [];
                fromLegacyTexture = [];

                texture = wrap(savedFlatTexture, width / 2);

                savedPalette = palettes.get(entryName);
                if (savedPalette) {
                    const fixedFlatTexture = savedFlatTexture.map((d) =>
                        palette.findIndex(savedPalette[d])
                    );

                    fixedTexture = wrap(fixedFlatTexture, width / 2);
                } else {
                    const fixedFlatTexture = savedFlatTexture.map((d) =>
                        palette.recoverIndex(d)
                    );

                    fromLegacyTexture = wrap(fixedFlatTexture, width / 2);
                }
            } else {
                texture = empty(width / 2, height / 2, palette.getDefault());
            }

            issues = issues;
        });

        setTimeout(() => {
            const versionCount = $downloadedVersions.length;
            const selectedIndex = $downloadedVersions.indexOf($selectedVersion);
            let lastData;

            const findin = (version, filename) => {
                const { zip } = cachedVersions[version];

                // Forders were named `blocks` and `items` before 1.13
                if (lt(version, '1.13')) {
                    filename = filename
                        .replace('/item/', '/items/')
                        .replace('/block/', '/blocks/');
                } else {
                    filename = filename
                        .replace('/items/', '/item/')
                        .replace('/blocks/', '/block/');
                }

                return dataToUri(zip.getEntry(filename)?.getData());
            };

            lastData = previewSrc;
            for (let i = selectedIndex - 1; i >= 0; i -= 1) {
                const newerVersion = $downloadedVersions[i];
                const newerData = findin(newerVersion, entryName);

                if (newerData === null) {
                    break;
                }

                if (newerData !== lastData) {
                    lastData = changes[newerVersion] = newerData;
                }
            }

            lastData = previewSrc;
            for (let i = selectedIndex + 1; i < versionCount; i += 1) {
                const olderVersion = $downloadedVersions[i];
                const olderData = findin(olderVersion, entryName);

                if (olderData === null) {
                    break;
                }

                if (olderData !== lastData) {
                    lastData = changes[olderVersion] = olderData;
                }
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

    function onCopy() {
        $textureClipboard = {
            texture: flatten(texture),
            colors: texturePalette.toArray(),
        };
    }

    function onPaste() {
        const { texture, colors } = $textureClipboard;
        const availableColors = texturePalette.toArray();
        const fallbackIndex = texturePalette.getDefault();

        pasteRawTexture = wrap(texture, 8);
        pasteColorTexture = wrap(
            texture.map((index) => {
                const mapped = availableColors.indexOf(colors[index]);

                if (mapped >= 0) {
                    return mapped;
                }

                return fallbackIndex;
            }),
            8
        );

        pasteColors = colors;

        pasteModalOpen = true;
        pasteMode = null;
    }

    function onFixApply() {
        if (fixMode === FIX_AUTO) {
            texture = fixedTexture;
        }

        if (fixMode === FIX_LEGACY) {
            texture = fromLegacyTexture;
        }

        issueModalOpen = false;
        fixMode = null;
    }

    function onPasteApply() {
        if (pasteMode === PASTE_INDICES) {
            texture = pasteRawTexture;
        }

        if (pasteMode === PASTE_COLORS) {
            texture = pasteColorTexture;
        }

        pasteModalOpen = false;
        pasteMode = null;
    }

    function onSave() {
        drafts.set(entryName, isDraft);
        versions.set(entryName, $selectedVersion);
        palettes.set(entryName, texturePalette.toArray());
        textures.set(entryName, flatten(texture));

        if ($closeOnSave) {
            dispatch('close');
        }
    }
</script>

<div class="editor" class:active>
    <div class="layout-box">
        <div>
            <CompareSwitcher>
                <ComparePanel label={$selectedVersion}>
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

                {#each Object.entries(changes) as [version, data]}
                    <ComparePanel label={version}>
                        <div class="texture-parent">
                            <img alt="" src={data} />
                        </div>
                    </ComparePanel>
                {/each}
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
                        <!-- TODO: Pick matching colors from here -->
                        <img src={epPreviewSrc} alt="" />
                    </div>
                </ComparePanel>
            </CompareSwitcher>
        </div>

        <div class="tools">
            <div class="tool-group">
                <Button
                    kind="ghost"
                    isSelected={textureTool === TOOL_PEN}
                    on:click={() => (textureTool = TOOL_PEN)}
                    size="small"
                    iconDescription="Pen"
                    icon={Pen16}
                    tooltipPosition="left"
                />

                <Button
                    disabled
                    kind="ghost"
                    isSelected={textureTool === TOOL_PICK}
                    on:click={() => (textureTool = TOOL_PICK)}
                    size="small"
                    iconDescription="Pick"
                    icon={Eyedropper16}
                    tooltipPosition="left"
                />

                <Button
                    kind="ghost"
                    isSelected={textureTool === TOOL_FILL}
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
                    kind="ghost"
                    isSelected={textureTool === TOOL_SWAP}
                    on:click={() => (textureTool = TOOL_SWAP)}
                    size="small"
                    iconDescription="Swap"
                    icon={Shuffle16}
                    tooltipPosition="left"
                />

                <Button
                    kind="ghost"
                    isSelected={textureTool === TOOL_REPLACE}
                    on:click={() => (textureTool = TOOL_REPLACE)}
                    size="small"
                    iconDescription="Replace"
                    icon={CenterCircle16}
                    tooltipPosition="left"
                />
            </div>

            <div class="tool-group">
                <Button
                    kind="ghost"
                    isSelected={textureTool === TOOL_MOVE}
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
                <ComparePanel label={$selectedVersion}>
                    <div class="texture-preview-parent">
                        <div
                            class="texture-preview"
                            style="background-image: url({previewSrc});"
                        />
                    </div>
                </ComparePanel>

                {#each Object.entries(changes) as [version, data]}
                    <ComparePanel label={version}>
                        <div class="texture-preview-parent">
                            <div
                                class="texture-preview"
                                style="background-image: url({data});"
                            />
                        </div>
                    </ComparePanel>
                {/each}
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

                <ComparePanel label="Exported">
                    <div class="texture-preview-parent">
                        <div
                            class="texture-preview"
                            style="background-image: url({epPreviewSrc});"
                        />
                    </div>
                </ComparePanel>
            </CompareSwitcher>
        </div>
    </div>

    <div class="actions">
        <div class="action-group">
            <Button
                kind="secondary"
                size="field"
                icon={Copy16}
                on:click={onCopy}
            >
                Copy
            </Button>

            <Button
                kind="secondary"
                size="field"
                disabled={!$textureClipboard}
                icon={Paste16}
                on:click={onPaste}
            >
                Paste
            </Button>
        </div>

        <div class="action-group">
            <Checkbox labelText="Draft" size="sm" bind:checked={isDraft} />
        </div>

        <div class="action-group">
            <Button kind="primary" size="field" icon={Save16} on:click={onSave}>
                Save
            </Button>
        </div>
    </div>

    <Modal
        preventCloseOnClickOutside
        bind:open={issueModalOpen}
        size="sm"
        modalHeading="Fix issues with texture"
        primaryButtonText="Apply changes"
        secondaryButtonText="Fix manually"
        primaryButtonDisabled={fixMode === null}
        on:submit={onFixApply}
        on:click:button--secondary={() => (issueModalOpen = false)}
    >
        {#if issues.includes('old_samples')}
            <p class="issue">
                This texture was sampled using an older Minecraft version.
            </p>
        {/if}

        {#if issues.includes('too_many_colors')}
            <p class="issue">
                The saved version of this texture uses more colors than the
                palette provides.
            </p>

            {#if fromLegacyTexture.length}
                <table>
                    <tr>
                        <th>Current texture</th>

                        <th>Auto-fix</th>
                    </tr>

                    <tr>
                        <td>
                            <div class="button-padding">
                                <Preview
                                    size={16}
                                    colors={texturePalette.toArray()}
                                    {texture}
                                />
                            </div>
                        </td>

                        <td class:selected={fixMode === FIX_LEGACY}>
                            <Button
                                kind="ghost"
                                on:click={() => (fixMode = FIX_LEGACY)}
                            >
                                <Preview
                                    size={16}
                                    colors={texturePalette.toArray()}
                                    texture={fromLegacyTexture}
                                />
                            </Button>
                        </td>
                    </tr>
                </table>
            {/if}
        {/if}

        {#if issues.includes('no_palette')}
            <p class="issue">
                Issues cannot be recovered automatically as this texture was
                saved in an older version of lo-rez-editor.
            </p>
        {/if}

        {#if issues.includes('palette_changed')}
            <p class="issue">
                The color palette has changed since this texture was saved.
            </p>

            {#if fixedTexture.length}
                <table>
                    <tr>
                        <th>Saved palette</th>

                        <th>Current palette</th>
                    </tr>

                    <tr>
                        <td width="50%">
                            <PalettePreview colors={savedPalette} />
                        </td>

                        <td width="50%">
                            <PalettePreview
                                colors={[...texturePalette.colors]}
                            />
                        </td>
                    </tr>
                </table>

                <table>
                    <tr>
                        <th>Saved texture</th>

                        <th>Auto-fix</th>
                    </tr>

                    <tr>
                        <td>
                            <div class="button-padding">
                                <Preview
                                    size={16}
                                    colors={savedPalette}
                                    {texture}
                                />
                            </div>
                        </td>

                        <td class:selected={fixMode === FIX_AUTO}>
                            <Button
                                kind="ghost"
                                on:click={() => (fixMode = FIX_AUTO)}
                            >
                                <Preview
                                    size={16}
                                    colors={texturePalette.toArray()}
                                    texture={fixedTexture}
                                />
                            </Button>
                        </td>
                    </tr>
                </table>
            {/if}
        {/if}
    </Modal>

    <Modal
        preventCloseOnClickOutside
        bind:open={pasteModalOpen}
        size="sm"
        modalHeading="Paste clipboard"
        primaryButtonText="Apply texture"
        secondaryButtonText="Cancel"
        hasScrollingContent
        primaryButtonDisabled={pasteMode === null}
        on:submit={onPasteApply}
        on:click:button--secondary={() => (pasteModalOpen = false)}
    >
        <table>
            <tr>
                {#if pasteColors && pasteRawTexture}
                    <th>Clipboard</th>
                {/if}

                {#if pasteRawTexture}
                    <th>Paste indices</th>
                {/if}

                {#if pasteColorTexture}
                    <th>Paste colors</th>
                {/if}
            </tr>

            <tr>
                {#if pasteColors && pasteRawTexture}
                    <td>
                        <div class="button-padding">
                            <Preview
                                size={16}
                                colors={pasteColors}
                                texture={pasteRawTexture}
                            />
                        </div>
                    </td>
                {/if}

                {#if pasteRawTexture}
                    <td class:selected={pasteMode === PASTE_INDICES}>
                        <Button
                            kind="ghost"
                            on:click={() => (pasteMode = PASTE_INDICES)}
                        >
                            <Preview
                                size={16}
                                colors={texturePalette.toArray()}
                                texture={pasteRawTexture}
                            />
                        </Button>
                    </td>
                {/if}

                {#if pasteColorTexture}
                    <td class:selected={pasteMode === PASTE_COLORS}>
                        <Button
                            kind="ghost"
                            on:click={() => (pasteMode = PASTE_COLORS)}
                        >
                            <Preview
                                size={16}
                                colors={texturePalette.toArray()}
                                texture={pasteColorTexture}
                            />
                        </Button>
                    </td>
                {/if}
            </tr>
        </table>
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
        background: var(--tex-transparent-background);
    }

    // What, a table? In 2021?
    table {
        // width: 100%;
        table-layout: fixed;

        th {
            text-align: left;

            color: var(--cds-text-02);
            padding-bottom: var(--cds-spacing-03);

            font-size: var(--cds-productive-heading-01-font-size);
            font-weight: normal;
            line-height: var(--cds-productive-heading-01-line-height);
            letter-spacing: var(--cds-productive-heading-01-letter-spacing);
        }

        td {
            vertical-align: top;

            &.selected {
                background-color: var(--cds-field-02);
            }
        }
    }

    // This is not ideal, button paddings might change
    .button-padding {
        padding: calc(0.875rem - 3px) 16px;
    }

    .layout-box {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
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
        align-items: flex-start;

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

        background: var(--tex-transparent-background);
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

        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }

    .issue {
        color: var(--cds-text-error);
    }
</style>
