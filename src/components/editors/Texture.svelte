<script>
    import { extract } from '../../modules/extractor';
    import Canvas from '../atoms/PixelCanvas.svelte';

    export let zipEntry;
    export let active = false;

    let texturePalette = [];
    let texture = [];

    const dataUriPrefix = 'data:image/png;base64,';

    $: zipContent = zipEntry?.getData().toString('binary');
    $: previewSrc = dataUriPrefix + btoa(zipContent || '');

    $: extract(previewSrc, ({ width, height, palette }) => {
        texturePalette = [...palette];
        texture = Array(height / 2).fill(null)
            .map(y => Array(width / 2).fill(null));
    });
</script>

<div class="editor" class:active={active}>
    <div class="layout-box texture-split">
        <div class="texture-parent">
            <img src={previewSrc} alt="" />
        </div>

        <div class="texture-parent">
            <div>
                <Canvas {texture} palette={texturePalette} />
            </div>
        </div>
    </div>

    <div class="layout-box">
        <ul class="palette-parent">
            {#each texturePalette as color}
                <li style="background: {color};" />
            {/each}
        </ul>
    </div>
</div>

<style lang="scss">
    .editor{
        display: flex;
        flex-direction: column;
        gap: var(--cds-spacing-02);

        &:not(.active) {
            display: none;
        }
    }

    img {
        image-rendering: pixelated;
    }

    .layout-box {
        display: flex;
        flex-direction: row;
        gap: var(--cds-spacing-02);

        > * {
            flex: 1 1 1%;
            min-width: 1px;

            background-color: var(--cds-field-01);
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

    .palette-parent {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cds-spacing-03);

        list-style: none;
        padding: var(--cds-spacing-04);

        li {
            display: block;
            width: 16px;
            height: 16px;
        }
    }
</style>
