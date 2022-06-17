<script>
    import { createEventDispatcher } from 'svelte';

    import {
        TOOL_PEN,
        TOOL_FILL,
        TOOL_REPLACE,
        TOOL_MOVE,
    } from '@/consts/tools.js';
    import { activeTextureTool } from '@/stores/tools.js';

    import { empty } from '@/modules/texture.js';
    import { VectorSet2D } from '@/struct/vector2d-set.js';
    import { Vector2D } from '@/struct/vector2d.js';

    export let texture;
    export let palette;
    export let override;

    export let frame = 0;
    export let base = 16;
    export let size = 24;

    const dispatch = createEventDispatcher();

    let moveParent;
    let actionCollection = new VectorSet2D();
    let isPressing = false;

    $: height = texture?.length || 0;
    $: width = texture[0]?.length || 0;
    $: colors = [...(palette?.colors || [])];

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

    $: preview = Array(height)
        .fill(null)
        .map(() => Array(width).fill(null));

    function textureAt(x, y) {
        return colors[texture[y][x]] || null;
    }

    function previewAt(x, y, tex) {
        return colors[tex[y][x]] || null;
    }

    function clear(container) {
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                container[y][x] = null;
            }
        }
    }

    function penPut(container, canvasX, canvasY, value) {
        container[canvasY][canvasX] = value;
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

    function replacePut(container, canvasX, canvasY, value) {
        const originValue = texture[canvasY][canvasX];

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                if (texture[y][x] === originValue) {
                    container[y][x] = value;
                }
            }
        }
    }

    function movePut(container, vectors) {
        const size = vectors.length;

        if (size < 2) {
            return;
        }

        const first = vectors[0];
        const last = vectors[size - 1];
        const diffX = last.x - first.x;
        const diffY = last.y - first.y;
        const temp = empty(width, height, null);

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const moveX = (x - diffX + width) % width;
                const moveY = (y - diffY + height) % height;

                temp[y][x] = texture[moveY][moveX];
            }
        }

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                container[y][x] = temp[y][x];
            }
        }
    }

    function commit(container, index, vectorSet) {
        const vectors = vectorSet.toArray();

        if ($activeTextureTool === TOOL_PEN) {
            vectors.forEach((vector) =>
                penPut(container, vector.x, vector.y, index)
            );
        } else if ($activeTextureTool === TOOL_FILL) {
            vectors.forEach((vector) =>
                fillPut(container, vector.x, vector.y, index)
            );
        } else if ($activeTextureTool === TOOL_REPLACE) {
            vectors.forEach((vector) =>
                replacePut(container, vector.x, vector.y, index)
            );
        } else if ($activeTextureTool === TOOL_MOVE) {
            movePut(container, vectors);
        }
    }

    function put(event) {
        event.preventDefault();

        const { pageX, pageY } = event;
        const { left, top } = moveParent.getBoundingClientRect();

        const canvasX = Math.floor((pageX - left) / 24);
        const canvasY = Math.floor((pageY - top) / 24);
        const point = new Vector2D(canvasX, canvasY);

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

        actionCollection.add(point);

        commit(preview, palette.index, actionCollection);
        preview = preview;

        if ($activeTextureTool === TOOL_MOVE) {
            const first = actionCollection.toArray()[0];

            actionCollection.clear();
            actionCollection.add(first).add(point);
        }
    }

    function onMove(event) {
        put(event);

        if (!isPressing) {
            actionCollection.clear();
        }
    }

    function onLeave() {
        clear(preview);
        preview = preview;
    }

    function onRelease() {
        isPressing = false;
        document.removeEventListener('mouseup', onRelease);

        commit(texture, palette.index, actionCollection);
        texture = texture;

        actionCollection.clear();

        dispatch('change');
    }

    function onPress(event) {
        document.addEventListener('mouseup', onRelease);
        isPressing = true;

        put(event);
    }
</script>

<div class="wrapper" style={wrapperStyle}>
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
                        style="background-color: {previewAt(
                            x,
                            y,
                            override ?? preview
                        ) ?? textureAt(x, y, texture)}"
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

    .canvas {
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

        width: 24px;
        height: 24px;
    }
</style>
