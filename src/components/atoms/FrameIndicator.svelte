<script>
    export let frame = 0;
    export let totalFrames = 0;

    let frameArray = [];

    function init() {
        frameArray = new Array(totalFrames).fill(0).map((d, i) => i);
    }

    function onFrameClick(frameIndex) {
        frame = frameIndex;
    }

    $: init(totalFrames);
</script>

<div class="wrapper">
    {#each frameArray as index}
        <b
            class="frame"
            class:active={frame === index}
            on:click={() => onFrameClick(index)}
        />
    {/each}
</div>

<style lang="scss">
    .wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
    }

    .frame {
        width: 8px;
        height: 16px;

        margin-left: -1px;
        border: 1px solid var(--cds-field-02);

        &:first-child {
            margin-left: 0;
        }

        &.active {
            background-color: var(--cds-field-02);
        }
    }
</style>
