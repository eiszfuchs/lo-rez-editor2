<script>
    import { editors, activeEditor, closeEditor } from '@/stores/editors.js';
    import { transparentBackground } from '@/stores/settings.js';

    import {
        TRANSPARENT_BRIGHT,
        TRANSPARENT_DARK,
        TRANSPARENT_WHITE,
        TRANSPARENT_FUCHSIA,
        TRANSPARENT_BLACK,
    } from '@/consts/settings.js';

    $: dynamicStyle = [
        $transparentBackground === TRANSPARENT_BRIGHT
            ? '--tex-transparent-background: url(../tex/transparent.png)'
            : null,
        $transparentBackground === TRANSPARENT_DARK
            ? '--tex-transparent-background: url(../tex/transparent-dark.png)'
            : null,
        $transparentBackground === TRANSPARENT_WHITE
            ? '--tex-transparent-background: white'
            : null,
        $transparentBackground === TRANSPARENT_FUCHSIA
            ? '--tex-transparent-background: fuchsia'
            : null,
        $transparentBackground === TRANSPARENT_BLACK
            ? '--tex-transparent-background: black'
            : null,
    ]
        .filter((d) => !!d)
        .join(';');
</script>

<main style={dynamicStyle}>
    {#each $editors as editor (editor)}
        <svelte:component
            this={editor.ui}
            active={editor === $activeEditor}
            zipEntry={editor.zipEntry}
            on:close={() => closeEditor(editor)}
        />
    {/each}
</main>

<style lang="scss">
    main {
        grid-area: editor;
    }
</style>
