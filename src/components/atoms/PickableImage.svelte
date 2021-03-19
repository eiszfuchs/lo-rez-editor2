<script>
    import { createEventDispatcher } from 'svelte';
    import { extract } from '@/modules/extractor.js';

    export let src;
    export let frame = 0;
    export let scale = 1;
    export let base = 16;

    let width = 0;
    let height = 0;
    let frames = 0;

    let pick = () => null;

    const dispatch = createEventDispatcher();

    function init() {
        extract(src, ({ width: w, height: h, getAt }) => {
            width = w;
            height = w;
            pick = getAt;

            frames = (h / base) * (w / base);
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

    $: wrapperStyle = [
        `width: ${width * scale}px`,
        `height: ${height * scale}px`,
        `--frame-offset: ${frame * scale * height}px`,
    ]
        .filter((d) => !!d)
        .join(';');
</script>

<div class="wrapper" style={wrapperStyle}>
    <img
        alt=""
        {src}
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
        width: 100%;

        position: relative;
        bottom: var(--frame-offset);

        image-rendering: pixelated;
        background: var(--tex-transparent-background);
    }
</style>
