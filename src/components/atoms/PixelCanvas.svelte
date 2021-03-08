<script context="module">
    export const TOOL_PEN = 'pen';
    export const TOOL_FILL = 'fill';
    export const TOOL_PICK = 'pick';
    export const TOOL_SWAP = 'swap';
</script>

<script>
    export let texture;
    export let palette;
    export let tool = TOOL_PEN;

    let moveParent;
    let isPressing = false;

    $: height = texture?.length || 0;
    $: width = texture[0]?.length || 0;
    $: colors = [...(palette?.colors || [])];

    $: preview = Array(height)
        .fill(null)
        .map(() => Array(width).fill(null));

    function textureAt(x, y) {
        return colors[texture[y][x]] || null;
    }

    function previewAt(x, y) {
        return colors[preview[y][x]] || null;
    }

    function clear(container) {
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                container[y][x] = null;
            }
        }
    }

    function fillPut(container, canvasX, canvasY, value) {
        const originValue = texture[canvasY][canvasX];
        const visited = new Set();

        function visit(x, y) {
            if (x < 0 || x >= width || y < 0 || y >= height) {
                return;
            }

            const position = `${x}/${y}`;
            if (visited.has(position)) {
                return;
            }

            visited.add(position);

            const positionValue = texture[y][x];
            if (positionValue !== originValue) {
                return;
            }

            container[y][x] = value;

            visit(x + 1, y);
            visit(x, y + 1);
            visit(x - 1, y);
            visit(x, y - 1);
        }

        visit(canvasX, canvasY);
    }

    function penPut(container, canvasX, canvasY, value) {
        container[canvasY][canvasX] = value;
    }

    function put(event) {
        event.preventDefault();

        const { pageX, pageY } = event;
        const { top, left } = moveParent.getBoundingClientRect();

        const canvasX = Math.floor((pageX - left) / 24);
        const canvasY = Math.floor((pageY - top) / 24);

        clear(preview);
        preview = preview;

        if (
            canvasX < 0 ||
            canvasX >= width ||
            canvasY < 0 ||
            canvasY >= height
        ) {
            return;
        }

        let conditionalPut = () => {};

        if (tool === TOOL_PEN) {
            conditionalPut = penPut;
        } else if (tool === TOOL_FILL) {
            conditionalPut = fillPut;
        }

        if (isPressing) {
            conditionalPut(texture, canvasX, canvasY, palette.index);
            texture = texture;
        } else {
            conditionalPut(preview, canvasX, canvasY, palette.index);
            preview = preview;
        }
    }

    function onMove(event) {
        put(event);
    }

    function onLeave() {
        clear(preview);
        preview = preview;
    }

    function onRelease() {
        isPressing = false;
        document.removeEventListener('mouseup', onRelease);
    }

    function onPress(event) {
        document.addEventListener('mouseup', onRelease);
        isPressing = true;

        put(event);
    }
</script>

<div
    class="canvas"
    bind:this={moveParent}
    on:mousedown={onPress}
    on:mousemove={onMove}
    on:mouseleave={onLeave}
>
    {#each Array(height) as _, y}
        <div class="row">
            {#each Array(width) as _, x}
                <div
                    class="pixel"
                    style="background-color: {previewAt(x, y, preview) ??
                        textureAt(x, y, texture)}"
                />
            {/each}
        </div>
    {/each}
</div>

<style lang="scss">
    .canvas {
        display: flex;
        flex-direction: column;

        background-image: var(--tex-transparent-background);
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    .pixel {
        position: relative;

        width: 24px;
        height: 24px;
    }
</style>
