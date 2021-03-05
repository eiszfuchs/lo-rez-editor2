<script>
    export let palette;
    export let highlight = [];

    function activate(index) {
        palette.index = index;
    }
</script>

{#if palette}
    <ul class="palette-parent">
        {#each [...palette.colors] as color, index}
            <li
                class:active={index === palette.index}
                class:highlighted={highlight.includes(color)}
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

            &.active {
                box-shadow: 0 0 0 2px var(--cds-ui-05);
            }

            &.highlighted {
                box-shadow: 0 0 0 2px var(--cds-highlight);

                position: relative;
                top: -2px;
            }

            &:hover {
                box-shadow: 0 0 0 2px var(--cds-ui-04);
            }
        }
    }
</style>
