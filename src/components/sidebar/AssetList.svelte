<script>
    import { cachedVersions, selectedVersion } from '@/stores/mc-versions.js';
    import { openEditor } from '@/stores/editors.js';
    import { versions } from '@/stores/project.js';
    import { lt } from '@/modules/version.js';

    import { TextInput } from 'carbon-components-svelte';
    import WarningAltFilled16 from 'carbon-icons-svelte/lib/WarningAltFilled16';
    import ArrowDown16 from 'carbon-icons-svelte/lib/ArrowDown16';
    import ArrowUp16 from 'carbon-icons-svelte/lib/ArrowUp16';

    import SidebarLabel from '@/components/atoms/SidebarLabel.svelte';
    import TextureEditor from '@/components/editors/Texture.svelte';

    const sortCollator = new Intl.Collator();

    let zipEntries = [];
    let filterSearch = '';

    const capabilities = [
        {
            test: ({ entryName: name }) => {
                if (!name.endsWith('.png')) {
                    return false;
                }

                if (name.includes('fire_0') || name.includes('fire_1')) {
                    return false;
                }

                if (name.includes('/lava_')) {
                    return false;
                }

                if (name.includes('clock_')) {
                    return false;
                }

                if (name.includes('compass_')) {
                    return false;
                }

                return (
                    name.match(
                        /^assets\/minecraft\/textures\/(block|item)s?\//
                    ) !== null
                );
            },
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

    function outdated(filename) {
        return lt(versions.get(filename), $selectedVersion);
    }

    function fromFuture(filename) {
        return lt($selectedVersion, versions.get(filename));
    }

    $: {
        zipEntries = [];

        if ($selectedVersion) {
            const { zip } = cachedVersions[$selectedVersion];

            zipEntries = zip
                .getEntries()
                .map((entry) => {
                    for (const capability of capabilities) {
                        if (capability.test(entry)) {
                            const label = capability.label(entry);

                            return {
                                label,
                                filename: entry.entryName,
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
            <li
                class="entry"
                class:hidden={!entry.label.includes(filterSearch)}
                on:click={entry.onClick}
            >
                <span>{entry.label}</span>

                {#if !versions.has(entry.filename)}
                    <WarningAltFilled16 />
                {:else if outdated(entry.filename)}
                    <ArrowDown16 />
                {:else if fromFuture(entry.filename)}
                    <ArrowUp16 />
                {/if}
            </li>
        {/each}
    </ul>

    <div class="form">
        <TextInput
            inline
            light
            size="sm"
            labelText="Search"
            placeholder="Filter by name..."
            disabled={!$selectedVersion}
            bind:value={filterSearch}
        />
    </div>
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

        &::-webkit-scrollbar {
            width: var(--cds-spacing-03);
        }

        &::-webkit-scrollbar-track {
            background: var(--cds-field-02);
        }

        &::-webkit-scrollbar-thumb {
            background-color: var(--cds-ui-04);
        }
    }

    .form {
        flex: 0 1 auto;
        margin-top: var(--cds-spacing-03);
    }

    .entry {
        display: flex;
        flex-direction: row;
        align-items: center;

        cursor: pointer;

        color: var(--cds-interactive-02);
        margin: var(--cds-spacing-01) var(--cds-spacing-02)
            var(--cds-spacing-01) 0;

        &:hover {
            color: var(--cds-hover-secondary);
        }

        &.hidden {
            display: none;
        }

        > span {
            flex: 1 1 auto;

            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            font-size: var(--cds-label-01-font-size);
            font-weight: var(--cds-label-01-font-weight);
            line-height: var(--cds-label-01-line-height);
            letter-spacing: var(--cds-label-01-letter-spacing);
        }
    }
</style>
