<script context="module">
    export const FIX_AUTO = 'auto';
    export const FIX_LEGACY = 'legacy';
    export const FIX_EXPORT = 'export';

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

    import Canvas from '../atoms/PixelCanvas.svelte';
    import PickableImage from '../atoms/PickableImage.svelte';
    import PalettePicker from '../atoms/PalettePicker.svelte';
    import PalettePreview from '../atoms/PalettePreview.svelte';
    import CompareSwitcher from '../atoms/CompareSwitcher.svelte';
    import ComparePanel from '../atoms/ComparePanel.svelte';
    import ChoiceTable from '../modules/ChoiceTable.svelte';

    import {
        cachedVersions,
        downloadedVersions,
        selectedVersion,
    } from '@/stores/mc-versions.js';

    import { drafts, palettes, textures, versions } from '@/stores/project.js';
    import { textureClipboard } from '@/stores/clipboard.js';
    import {
        activeTextureTool,
        TOOL_PEN,
        TOOL_FILL,
        TOOL_PICK,
        TOOL_SWAP,
        TOOL_REPLACE,
        TOOL_MOVE,
    } from '@/stores/tools.js';
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
    let fromExportTexture = [];
    let savedPalette = [];
    let fixOptions = [];
    let fixMode = null;

    let pasteRawTexture = null;
    let pasteColorTexture = null;
    let pasteColors = null;
    let pasteModalOpen = false;
    let pasteOptions = [];
    let pasteMode = null;

    let texturePalette = null;
    let texture = [];
    let textureOverride = null;

    const dispatch = createEventDispatcher();

    const dataUriPrefix = 'data:image/png;base64,';

    const dataToUri = (data) =>
        !data ? null : dataUriPrefix + btoa(data.toString('binary') || '');

    $: entryName = zipEntry?.entryName;
    $: previewSrc = dataToUri(zipEntry?.getData());
    $: loPreviewSrc = paint(texture, texturePalette);
    $: epPreviewSrc = `../lo-rez/${entryName}`;

    function init() {
        console.info(`Opening texture editor for ${entryName}`);

        changes = {};
        fixOptions = [];

        isDraft = drafts.get(entryName, false);

        extract(previewSrc, ({ width, height, palette }) => {
            texturePalette = palette;

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

                    fixOptions = [
                        ...fixOptions,
                        {
                            heading: 'Saved texture',
                            size: 16,
                            colors: savedPalette,
                            texture: texture,
                        },
                        {
                            heading: 'Auto-fix',
                            value: FIX_AUTO,
                            size: 16,
                            colors: texturePalette.toArray(),
                            texture: fixedTexture,
                        },
                    ];
                } else {
                    const fixedFlatTexture = savedFlatTexture.map((d) => {
                        try {
                            return palette.recoverIndex(d);
                        } catch (reason) {
                            return texturePalette.getDefault();
                        }
                    });

                    fromLegacyTexture = wrap(fixedFlatTexture, width / 2);

                    fixOptions = [
                        ...fixOptions,
                        {
                            heading: 'From legacy',
                            value: FIX_LEGACY,
                            size: 16,
                            colors: texturePalette.toArray(),
                            texture: fromLegacyTexture,
                        },
                    ];
                }
            } else {
                texture = empty(width / 2, height / 2, palette.getDefault());
            }

            fixOptions = [
                {
                    heading: 'Current texture',
                    size: 16,
                    colors: texturePalette.toArray(),
                    texture: texture,
                },
                ...fixOptions,
            ];

            extract(epPreviewSrc, ({ width, height, getAt }) => {
                fromExportTexture = empty(width, height, palette.getDefault());

                for (let y = 0; y < height; y += 1) {
                    for (let x = 0; x < width; x += 1) {
                        let index = palette.getDefault();

                        try {
                            index = texturePalette.findIndex(getAt(x, y), 32);
                        } catch (reason) {}

                        fromExportTexture[y][x] = index;
                    }
                }

                fixOptions = [
                    ...fixOptions,
                    {
                        heading: 'From exported',
                        value: FIX_EXPORT,
                        size: 16,
                        colors: texturePalette.toArray(),
                        texture: fromExportTexture,
                    },
                ];
            });

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

    let highlightPalette = [];

    function onPickablePick({ detail: { x, y, color } }) {
        try {
            if ($activeTextureTool === TOOL_PICK) {
                texture = textureOverride;
                textureOverride = null;
            } else {
                return texturePalette.setColor(color);
            }
        } catch (reason) {
            return;
        }
    }

    function onPickableHover({ detail: { x = 0, y = 0, pick, color } }) {
        highlightPalette = [];
        textureOverride = null;

        if ($activeTextureTool === TOOL_PICK) {
            if (!pick) {
                return;
            }

            // This feature is pretty hacked together and I don't like how it turned out.
            // But it may be useful, so I decided to not remove it.
            const height = texture?.length || 0;
            const width = texture[0]?.length || 0;
            const defaultColor = texturePalette.getDefault();

            textureOverride = empty(width, height, defaultColor);

            for (let ty = 0; ty < height; ty += 1) {
                for (let tx = 0; tx < width; tx += 1) {
                    const pickX = (x + tx) % (width * 2);
                    const pickY = (y + ty) % (height * 2);
                    const color = pick(pickX, pickY);

                    let index = defaultColor;

                    try {
                        index = texturePalette.findIndex(color, 4);
                    } catch (reason) {}

                    textureOverride[ty][tx] = index;
                }
            }

            textureOverride = textureOverride;
        } else {
            if (!color) {
                return;
            }

            highlightPalette = [color];
        }
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

        pasteColors = colors;

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

        pasteOptions = [
            {
                heading: 'Clipboard',
                size: 16,
                colors: pasteColors,
                texture: pasteRawTexture,
            },
            {
                heading: 'Paste indices',
                value: PASTE_INDICES,
                size: 16,
                colors: availableColors,
                texture: pasteRawTexture,
            },
            {
                heading: 'Paste colors',
                value: PASTE_COLORS,
                size: 16,
                colors: availableColors,
                texture: pasteColorTexture,
            },
        ];

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

        if (fixMode === FIX_EXPORT) {
            texture = fromExportTexture;
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
                        <PickableImage
                            src={previewSrc}
                            scale={12}
                            on:pick={onPickablePick}
                            on:hover={onPickableHover}
                        />
                    </div>
                </ComparePanel>

                {#each Object.entries(changes) as [version, data]}
                    <ComparePanel label={version}>
                        <div class="texture-parent">
                            <PickableImage
                                src={data}
                                scale={12}
                                on:pick={onPickablePick}
                                on:hover={onPickableHover}
                            />
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
                                palette={texturePalette}
                                override={textureOverride}
                                on:change={() => (texture = texture)}
                            />
                        </div>
                    </div>
                </ComparePanel>

                <ComparePanel label="Exported">
                    <div class="texture-parent">
                        <PickableImage
                            src={epPreviewSrc}
                            base={8}
                            scale={24}
                            on:pick={onPickablePick}
                            on:hover={onPickableHover}
                        />
                    </div>
                </ComparePanel>
            </CompareSwitcher>
        </div>

        <div class="tools">
            <div class="tool-group">
                <Button
                    kind="ghost"
                    isSelected={$activeTextureTool === TOOL_PEN}
                    on:click={() => activeTextureTool.set(TOOL_PEN)}
                    size="small"
                    iconDescription="Pen"
                    icon={Pen16}
                    tooltipPosition="left"
                />

                <Button
                    kind="ghost"
                    isSelected={$activeTextureTool === TOOL_PICK}
                    on:click={() => activeTextureTool.set(TOOL_PICK)}
                    size="small"
                    iconDescription="Pick"
                    icon={Eyedropper16}
                    tooltipPosition="left"
                />

                <Button
                    kind="ghost"
                    isSelected={$activeTextureTool === TOOL_FILL}
                    on:click={() => activeTextureTool.set(TOOL_FILL)}
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
                    isSelected={$activeTextureTool === TOOL_SWAP}
                    on:click={() => activeTextureTool.set(TOOL_SWAP)}
                    size="small"
                    iconDescription="Swap"
                    icon={Shuffle16}
                    tooltipPosition="left"
                />

                <Button
                    kind="ghost"
                    isSelected={$activeTextureTool === TOOL_REPLACE}
                    on:click={() => activeTextureTool.set(TOOL_REPLACE)}
                    size="small"
                    iconDescription="Replace"
                    icon={CenterCircle16}
                    tooltipPosition="left"
                />
            </div>

            <div class="tool-group">
                <Button
                    kind="ghost"
                    isSelected={$activeTextureTool === TOOL_MOVE}
                    on:click={() => activeTextureTool.set(TOOL_MOVE)}
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
        {#if issues.includes('no_palette')}
            <p class="issue">
                This texture was saved in an older version of lo-rez-editor.
            </p>
        {/if}

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
        {/if}

        {#if issues.includes('palette_changed')}
            <p class="issue">
                The color palette has changed since this texture was saved.
            </p>

            <p class="help">
                <span>Saved palette</span>
                <PalettePreview colors={savedPalette} />
            </p>

            <p class="help">
                <span>Current palette</span>
                <PalettePreview colors={[...texturePalette.colors]} />
            </p>
        {/if}

        <ChoiceTable bind:choice={fixMode} options={fixOptions} />
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
        <ChoiceTable bind:choice={pasteMode} options={pasteOptions} />
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
        align-items: center;
        justify-content: center;

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
        margin-bottom: var(--cds-spacing-04);
    }

    .help {
        margin-bottom: var(--cds-spacing-04);
    }
</style>
