<script>
    import { Button } from 'carbon-components-svelte';
    import Preview from '../atoms/PixelPreview.svelte';

    export let choice = null;
    export let options = [];

    const base = 8;
</script>

<table>
    <tr>
        {#each options as { heading }}
            <th>{heading}</th>
        {/each}
    </tr>

    <tr>
        {#each options as { value, size, texture, colors }}
            {#if value}
                <td class:selected={choice === value}>
                    <Button kind="ghost" on:click={() => (choice = value)}>
                        <Preview {size} {base} {colors} {texture} />
                    </Button>
                </td>
            {:else}
                <td>
                    <div class="button-padding">
                        <Preview {size} {base} {colors} {texture} />
                    </div>
                </td>
            {/if}
        {/each}
    </tr>
</table>

<style lang="scss">
    // What, a table? In 2021?
    table {
        table-layout: fixed;

        th {
            text-align: left;

            color: var(--cds-text-02);
            padding-bottom: var(--cds-spacing-03);

            font-size: var(--cds-productive-heading-01-font-size);
            font-weight: normal;
            line-height: var(--cds-productive-heading-01-line-height);
            letter-spacing: var(--cds-productive-heading-01-letter-spacing);
        }

        td {
            vertical-align: top;

            &.selected {
                background-color: var(--cds-field-02);
            }
        }
    }

    // This is not ideal, button paddings might change
    .button-padding {
        padding: calc(0.875rem - 3px) 16px;
    }
</style>
