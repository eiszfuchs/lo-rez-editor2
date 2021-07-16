<script>
    export let texture;
    export let colors;
    export let size = 24;

    $: height = texture?.length || 0;
    $: width = texture[0]?.length || 0;

    function textureAt(x, y) {
        return colors[texture[y][x]] || null;
    }
</script>

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

<style lang="scss">
    .preview {
        display: flex;
        flex-direction: column;

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
