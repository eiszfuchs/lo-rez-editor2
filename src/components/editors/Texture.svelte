<script>
    import { Button } from 'carbon-components-svelte';
    import Pen16 from 'carbon-icons-svelte/lib/Pen16';
    import Eyedropper16 from 'carbon-icons-svelte/lib/Eyedropper16';
    import TextFill16 from 'carbon-icons-svelte/lib/TextFill16';

    import Canvas from '../atoms/PixelCanvas.svelte';
    import PalettePicker from '../atoms/PalettePicker.svelte';
    import CompareSwitcher from '../atoms/CompareSwitcher.svelte';
    import ComparePanel from '../atoms/ComparePanel.svelte';

    import { extract } from '../../modules/extractor';

    export let zipEntry;
    export let active = false;

    let texturePalette = null;
    let texture = [];
    let texturePicker;

    const dataUriPrefix = 'data:image/png;base64,';

    $: zipContent = zipEntry?.getData().toString('binary');
    $: previewSrc = dataUriPrefix + btoa(zipContent || '');

    $: extract(previewSrc, ({ width, height, palette, getAt }) => {
        texturePalette = palette;
        texturePicker = getAt;

        texture = Array(height / 2)
            .fill(null)
            .map((y) => Array(width / 2).fill(null));
    });

    let highlightPalette = [];

    function leaveOriginal() {
        highlightPalette = [];
    }

    function overOriginal(event) {
        const pixelX = Math.floor(event.offsetX / 12);
        const pixelY = Math.floor(event.offsetY / 12);

        highlightPalette = [texturePicker(pixelX, pixelY)];
    }
</script>

<div class="editor" class:active>
    <div class="layout-box">
        <div>
            <CompareSwitcher>
                <ComparePanel label="Original">
                    <div class="texture-parent">
                        <img
                            src={previewSrc}
                            alt=""
                            on:mousemove={overOriginal}
                            on:mouseleave={leaveOriginal}
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
                            <Canvas {texture} palette={texturePalette} />
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
                    kind="secondary"
                    size="small"
                    iconDescription="Pen"
                    icon={Pen16}
                    tooltipPosition="left"
                />

                <Button
                    kind="ghost"
                    size="small"
                    disabled
                    iconDescription="Fill"
                    icon={TextFill16}
                    tooltipPosition="left"
                />

                <Button
                    kind="ghost"
                    size="small"
                    disabled
                    iconDescription="Pick"
                    icon={Eyedropper16}
                    tooltipPosition="left"
                />
            </div>
        </div>
    </div>

    <div>
        <PalettePicker palette={texturePalette} highlight={highlightPalette} />
    </div>
</div>

<style lang="scss">
    .editor {
        display: flex;
        flex-direction: column;
        gap: var(--cds-spacing-02);

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

    .tool-group {
    }
</style>
