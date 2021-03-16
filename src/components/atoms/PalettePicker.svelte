<script>
    import { onDestroy } from 'svelte';

    export let palette;
    export let highlight = [];

    let unsubscribe = () => {};
    let highlightedIndices = [];

    function update() {
        palette = palette;
    }

    function activate(index) {
        palette.setIndex(index);
    }

    $: if (palette) {
        highlightedIndices = highlight.map((color) => palette.findIndex(color));
    }

    $: if (palette) {
        unsubscribe();
        unsubscribe = palette.subscribe(update);
    }

    onDestroy(() => {
        unsubscribe();
    });
</script>

{#if palette}
    <ul class="palette-parent">
        {#each [...palette.colors] as color, index}
            <li
                title={color.toUpperCase()}
                class:active={index === palette.index}
                class:highlighted={highlightedIndices.includes(index)}
                on:click={() => activate(index)}
            >
                <b style="background-color: {color};" />
            </li>
        {/each}
    </ul>
{/if}

<style lang="scss">
    .palette-parent {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cds-spacing-03);

        background-color: var(--cds-field-01);

        list-style: none;
        padding: var(--cds-spacing-04);

        li {
            display: flex;
            align-items: stretch;

            width: 16px;
            height: 16px;

            box-shadow: 0 0 0 2px var(--cds-ui-02);
            background-image: var(--tex-transparent-background);

            cursor: pointer;

            b {
                flex: 1 0 100%;
            }

            &.highlighted {
                position: relative;
                top: -2px;
            }

            &.active {
                box-shadow: 0 0 0 2px var(--cds-ui-05);
            }

            &:hover {
                box-shadow: 0 0 0 2px var(--cds-ui-04);
            }
        }
    }
</style>
