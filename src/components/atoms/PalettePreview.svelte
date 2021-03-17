<script>
    export let colors = [];
</script>

<ul class="palette-parent">
    {#each colors as color}
        <li title={color.toUpperCase()}>
            <b style="color: {color};" />
        </li>
    {/each}
</ul>

<style lang="scss">
    .palette-parent {
        display: flex;
        flex-wrap: wrap;
        list-style: none;

        background-color: var(--cds-field-01);

        li {
            display: flex;
            align-items: stretch;

            width: 20px;
            height: 20px;
            padding: 3px;

            background-image: var(--tex-transparent-background);

            b {
                flex: 1 0 100%;
                background-color: currentColor;
                box-shadow: 0 0 0 0 var(--cds-ui-background),
                    0 0 0 3px currentColor;

                transition: box-shadow 70ms linear;
            }
        }
    }
</style>
