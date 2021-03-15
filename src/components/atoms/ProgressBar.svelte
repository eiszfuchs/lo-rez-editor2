<script>
    export let value = 0;
    export let max = 100;

    $: progress = value / max;
</script>

<div class="progress">
    <b class="progress__bar" style="width: {progress * 100}%;" />
</div>

<style lang="scss">
    .progress {
        display: block;
        width: 100%;
        height: var(--cds-spacing-02);
        position: relative;

        background-color: var(--cds-ui-03);

        &__bar {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;

            background-color: var(--cds-interactive-04);
        }
    }
</style>
