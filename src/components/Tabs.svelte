<script>
    import { editors, activeEditor, closeEditor } from '@/stores/editors.js';

    import { Button } from 'carbon-components-svelte';
    import CloseOutline16 from 'carbon-icons-svelte/lib/CloseOutline16';

    function activate(editor) {
        $activeEditor = editor;
    }

    function close(editor) {
        closeEditor(editor);
    }
</script>

<nav>
    {#each $editors as editor}
        <div class="tab" class:active={editor === $activeEditor}>
            <span on:click={() => activate(editor)}>{editor.label}</span>

            <Button
                size="small"
                kind="ghost"
                iconDescription="Close tab"
                icon={CloseOutline16}
                on:click={() => close(editor)}
            />
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

        display: flex;
        flex-direction: row;
        align-content: space-between;
        align-items: stretch;

        background-color: var(--cds-field-01);

        opacity: 0.5;
        cursor: pointer;
        overflow: hidden;

        &.active {
            opacity: 1;
        }
    }

    .tab span {
        flex: 1 1 auto;

        display: block;
        max-width: 100%;
        padding-top: var(--cds-spacing-03);
        padding-left: var(--cds-spacing-04);

        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;

        &:hover {
            background-color: var(--cds-hover-field);
        }
    }
</style>
