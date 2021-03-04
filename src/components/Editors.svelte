<script>
    import { editors, activeEditor } from '@/stores/editors.js';
</script>

<main>
    {#each $editors as editor}
        <svelte:component
            this={editor.ui}
            active={editor === $activeEditor}
            zipEntry={editor.zipEntry}
        />
    {/each}
</main>

<style lang="scss">
    main {
        grid-area: editor;
    }
</style>
