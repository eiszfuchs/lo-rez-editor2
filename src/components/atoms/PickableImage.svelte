<script>
    import { createEventDispatcher } from 'svelte';
    import { extract } from '@/modules/extractor.js';

    export let src;
    export let frame = 0;
    export let scale = 1;
    export let base = 16;

    let width = 0;
    let height = 0;
    export let totalFrames = 0;

    let pick = () => null;

    const dispatch = createEventDispatcher();

    function init() {
        extract(src, ({ width: w, height: h, getAt }) => {
            width = w;
            height = h;
            pick = getAt;

            totalFrames = (h / base) * (w / base);
        });
    }

    const posFromEvent = (event) => [
        Math.floor(event.offsetX / scale),
        Math.floor(event.offsetY / scale),
    ];

    function leaveImage() {
        dispatch('hover', null);
    }

    function overImage(event) {
        const [pixelX, pixelY] = posFromEvent(event);

        dispatch('hover', pick(pixelX, pixelY));
        event.preventDefault();
    }

    function clickImage(event) {
        const [pixelX, pixelY] = posFromEvent(event);

        dispatch('pick', pick(pixelX, pixelY));
    }

    $: init(src);

    $: displaySize = base * scale;

    $: wrapperStyle = [
        `width: ${base * scale}px`,
        `height: ${base * scale}px`,
        `--frame-right-offset: ${
            Math.floor((frame * displaySize) / (height * scale)) * displaySize
        }px`,
        `--frame-bottom-offset: ${(frame * displaySize) % (height * scale)}px`,
    ]
        .filter((d) => !!d)
        .join(';');
</script>

<div class="wrapper" style={wrapperStyle}>
    <img
        alt=""
        {src}
        width={width * scale}
        height={height * scale}
        on:mousemove={overImage}
        on:mouseleave={leaveImage}
        on:click={clickImage}
    />
</div>

<style lang="scss">
    .wrapper {
        display: flex;
        align-items: flex-start;

        position: relative;
        overflow: hidden;
    }

    img {
        position: relative;
        right: var(--frame-right-offset, 0);
        bottom: var(--frame-bottom-offset, 0);

        image-rendering: pixelated;
        background: var(--tex-transparent-background);
    }
</style>
