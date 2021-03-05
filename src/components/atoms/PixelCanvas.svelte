<script>
    export let texture;
    export let palette;

    let moveParent;

    $: height = texture?.length || 0;
    $: width = texture[0]?.length || 0;
    $: colors = [...(palette?.colors || [])];

    function at(x, y) {
        return colors[texture[y][x]] || null;
    }

    function put(pageX, pageY) {
        const { top, left } = moveParent.getBoundingClientRect();

        const canvasX = Math.floor((pageX - left) / 24);
        const canvasY = Math.floor((pageY - top) / 24);

        if (canvasY >= 0 && canvasY < height) {
            if (canvasX >= 0 && canvasX < width) {
                texture[canvasY][canvasX] = palette.index;
                texture = texture;
            }
        }
    }

    function onMove(event) {
        put(event.pageX, event.pageY);
        event.preventDefault();
    }

    function onRelease() {
        document.removeEventListener('mouseup', onRelease);
        document.removeEventListener('mousemove', onMove);
    }

    function onPress(event) {
        document.addEventListener('mouseup', onRelease);
        document.addEventListener('mousemove', onMove);

        put(event.pageX, event.pageY);
        event.preventDefault();
    }
</script>

<div class="pixel-canvas" on:mousedown={onPress} bind:this={moveParent}>
    {#each Array(height) as _, y}
        <div class="row">
            {#each Array(width) as _, x}
                <div
                    data-x={x}
                    data-y={y}
                    class:null={at(x, y, texture) === null}
                    style="background-color: {at(x, y, texture)}"
                />
            {/each}
        </div>
    {/each}
</div>

<style lang="scss">
    .pixel-canvas {
        display: flex;
        flex-direction: column;

        background-image: var(--tex-transparent-background);
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    [data-x][data-y] {
        width: 24px;
        height: 24px;

        &.null {
            opacity: 0.75;

            background-attachment: fixed;
            background-image: var(--tex-null-background);
        }

        &:hover {
            box-shadow: inset 0 0 0 2px var(--cds-hover-light-ui);
        }
    }
</style>
