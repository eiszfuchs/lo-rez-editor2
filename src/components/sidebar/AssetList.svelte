<script>
    import { selectedVersion } from '@/stores/mc-versions.js';
    import { openEditor } from '@/stores/editors.js';

    import SidebarLabel from '@/components/atoms/SidebarLabel.svelte';
    import TextureEditor from '@/components/editors/Texture.svelte';

    const AdmZip = require('adm-zip');
    const sortCollator = new Intl.Collator();

    let zipEntries = [];

    const capabilities = [
        {
            test: ({ entryName }) =>
                entryName.match(
                    /^assets\/minecraft\/textures\/(block|item)/
                ) !== null,
            label: ({ entryName }) =>
                entryName.replace(/^assets\/minecraft\/textures\//, ''),
            open: ({ label, zipEntry }) =>
                openEditor({
                    ui: TextureEditor,
                    label,
                    zipEntry,
                }),
        },
    ];

    $: {
        zipEntries = [];

        if ($selectedVersion) {
            const targetFilename = `versions/${$selectedVersion}.jar`;
            const zip = new AdmZip(targetFilename);

            zipEntries = zip
                .getEntries()
                .map((entry) => {
                    for (const capability of capabilities) {
                        if (capability.test(entry)) {
                            const label = capability.label(entry);

                            return {
                                label,
                                onClick: () =>
                                    capability.open({
                                        label,
                                        zipEntry: entry,
                                    }),
                            };
                        }
                    }

                    return null;
                })
                .filter((e) => e !== null)
                .sort((a, b) => sortCollator.compare(a.label, b.label));
        }
    }
</script>

<div class="layout">
    <SidebarLabel>
        Asset list

        {#if $selectedVersion}
            ({$selectedVersion})
        {/if}
    </SidebarLabel>

    <!-- This is the actual list -->
    <ul class="assets">
        {#each zipEntries as entry}
            <li class="entry" on:click={entry.onClick}>{entry.label}</li>
        {/each}
    </ul>
</div>

<style lang="scss">
    .layout {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .assets {
        flex: 1 1 auto;
        overflow: hidden auto;
        min-height: 1px;
    }

    .entry {
        font-size: var(--cds-label-01-font-size);
        font-weight: var(--cds-label-01-font-weight);
        line-height: var(--cds-label-01-line-height);
        letter-spacing: var(--cds-label-01-letter-spacing);

        cursor: pointer;

        &:hover {
            color: var(--cds-text-04);
        }
    }
</style>
