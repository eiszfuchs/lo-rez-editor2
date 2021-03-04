<script>
    import { editors, activeEditor } from '@/stores/editors.js';

    function activate(editor) {
        $activeEditor = editor;
    }
</script>

<nav>
    {#each $editors as editor}
        <div
            class="tab"
            class:active={editor === $activeEditor}
            on:click={activate(editor)}
        >
            <span>{editor.label}</span>
        </div>
    {/each}
</nav>

<style lang="scss">
    nav {
        grid-area: tabs;

        display: flex;
        flex-direction: row;
        flex-wrap: wrap; // Makes items not wrap but shrink properly????
        gap: var(--cds-spacing-02);

        padding-right: var(--cds-spacing-06);
    }

    .tab {
        flex: 1 1 1%;
        min-width: 1px;

        padding: var(--cds-spacing-03);
        background-color: var(--cds-field-01);

        cursor: pointer;
        overflow: hidden;

        &:hover {
            background-color: var(--cds-hover-field);
        }

        &.active {
            background-color: var(--cds-field-02);
        }
    }

    .tab span {
        display: block;
        max-width: 100%;

        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
    }
</style>
