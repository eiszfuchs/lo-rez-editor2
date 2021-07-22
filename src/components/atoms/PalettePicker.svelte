<script>
    import { onDestroy } from 'svelte';

    import { sortNearest } from '@/modules/color.js';

    export let palette;
    export let highlight = [];
    export let used = [];

    let unsubscribe = () => {};
    let colorArray = [];
    let highlightedIndices = [];
    let sorted = [];

    function update() {
        palette = palette;
    }

    function activate(color) {
        palette.setColor(color);
    }

    $: if (palette) {
        highlightedIndices = highlight.map((color) => {
            try {
                return palette.findIndex(color);
            } catch (reason) {
                return;
            }
        });
    }

    $: if (palette) {
        unsubscribe();
        unsubscribe = palette.subscribe(update);

        colorArray = [...palette.colors];
        sorted = sortNearest(colorArray);
    }

    onDestroy(() => {
        unsubscribe();
    });
</script>

{#if palette}
    <ul class="palette-parent">
        {#each sorted as color}
            <li
                title={color.toUpperCase()}
                class:active={colorArray.indexOf(color) === palette.index}
                class:used={used.includes(colorArray.indexOf(color))}
                class:highlighted={highlightedIndices.includes(
                    colorArray.indexOf(color)
                )}
                on:click={() => activate(color)}
            >
                <b style="color: {color};" />
            </li>
        {/each}
    </ul>
{/if}

<style lang="scss">
    .palette-parent {
        display: flex;
        flex-wrap: wrap;

        background-color: var(--cds-field-01);

        list-style: none;
        padding: var(--cds-spacing-03);

        li {
            display: flex;
            align-items: stretch;

            width: 20px;
            height: 20px;
            padding: 3px;

            background: var(--tex-transparent-background);

            cursor: pointer;

            b {
                flex: 1 0 100%;
                background-color: currentColor;
                box-shadow: 0 0 0 0 var(--cds-ui-background),
                    0 0 0 3px currentColor;

                position: relative;

                transition: box-shadow 70ms linear;
            }

            &.highlighted {
                position: relative;
                top: -2px;
            }

            &.used {
                b::after {
                    content: '';

                    position: absolute;
                    bottom: -1px;
                    right: -1px;

                    width: 0;
                    height: 0;

                    border-style: solid;
                    border-width: 0 0 4px 4px;
                    border-color: transparent transparent
                        var(--cds-ui-background) transparent;
                }
            }

            &:hover {
                b {
                    box-shadow: 0 0 0 1px var(--cds-field-01),
                        0 0 0 3px currentColor;
                }
            }

            &.active {
                b {
                    box-shadow: 0 0 0 1px var(--cds-ui-background),
                        0 0 0 3px var(--cds-ui-05);
                }
            }
        }
    }
</style>
