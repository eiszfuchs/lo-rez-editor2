<script>
    import {
        Accordion,
        AccordionItem,
        Checkbox,
        Dropdown,
    } from 'carbon-components-svelte';

    import {
        TRANSPARENT_FOLLOW,
        TRANSPARENT_BRIGHT,
        TRANSPARENT_DARK,
        TRANSPARENT_WHITE,
        TRANSPARENT_FUCHSIA,
        TRANSPARENT_BLACK,
        closeOnSave,
        transparentBackground,
    } from '@/stores/settings.js';

    const transparencyItems = [
        { id: TRANSPARENT_FOLLOW, text: 'Follow system' },
        { id: TRANSPARENT_BRIGHT, text: 'Bright' },
        { id: TRANSPARENT_DARK, text: 'Dark' },
        { id: TRANSPARENT_WHITE, text: 'Solid white' },
        { id: TRANSPARENT_FUCHSIA, text: 'Solid fuchsia' },
        { id: TRANSPARENT_BLACK, text: 'Solid black' },
    ];

    let selectedTransparencyId = $transparentBackground;

    $: $transparentBackground = selectedTransparencyId;
</script>

<div class="border-hack">
    <Accordion size="sm">
        <AccordionItem title="Global settings">
            <Dropdown
                direction="top"
                titleText="Transparency"
                items={transparencyItems}
                bind:selectedId={selectedTransparencyId}
            />

            <div class="spacer" />

            <Checkbox
                labelText="Close editors on save"
                bind:checked={$closeOnSave}
            />
        </AccordionItem>
    </Accordion>
</div>

<style lang="scss">
    .spacer {
        height: var(--cds-spacing-04);
    }

    .border-hack {
        // Hacky trick to get rid of the funky accordion borders
        --cds-ui-03: transparent;
    }
</style>
