<script>
    import {
        Accordion,
        AccordionItem,
        Checkbox,
        Dropdown,
    } from 'carbon-components-svelte';
</script>

<!--
    TODO: Accordions sure are nice, but the borders
    and paddings don't quite fit the rest of the sidebar
-->
<Accordion size="sm">
    <AccordionItem title="Settings (TODO)">
        <p>
            <Checkbox labelText="Close editor on save" />
        </p>
        <p>
            <Dropdown
                type="inline"
                direction="top"
                titleText="Transparency"
                selectedIndex={0}
                items={[
                    { id: 'follow', text: 'Follow system' },
                    { id: 'bright', text: 'Bright' },
                    { id: 'dark', text: 'Dark' },
                ]}
            />
        </p>
    </AccordionItem>
</Accordion>
