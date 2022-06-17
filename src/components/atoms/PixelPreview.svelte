<script>
    export let texture;
    export let colors;
    export let frame = 0;
    export let base = 16;
    export let size = 24;

    $: height = texture?.length || 0;
    $: width = texture[0]?.length || 0;

    $: displaySize = base * size;

    $: wrapperStyle = [
        `width: ${base * size}px`,
        `height: ${base * size}px`,
        `--frame-right-offset: ${
            Math.floor((frame * displaySize) / (height * size)) * displaySize
        }px`,
        `--frame-bottom-offset: ${(frame * displaySize) % (height * size)}px`,
    ]
        .filter((d) => !!d)
        .join(';');

    function textureAt(x, y) {
        return colors[texture[y][x]] || null;
    }
</script>

<div class="wrapper" style={wrapperStyle}>
    <div class="preview" style="--size: {size}px;">
        {#each Array(height) as _, y}
            <div class="row">
                {#each Array(width) as _, x}
                    <div
                        class="pixel"
                        style="background-color: {textureAt(x, y, texture)};"
                    />
                {/each}
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
    .wrapper {
        display: flex;

        position: relative;
        overflow: hidden;
    }

    .preview {
        display: flex;
        flex-direction: column;

        position: relative;
        right: var(--frame-right-offset, 0);
        bottom: var(--frame-bottom-offset, 0);

        background: var(--tex-transparent-background);
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    .pixel {
        position: relative;

        width: var(--size);
        height: var(--size);
    }
</style>
