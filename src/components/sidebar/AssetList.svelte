<script>
    import { cachedVersions, selectedVersion } from '@/stores/mc-versions.js';
    import { openEditor } from '@/stores/editors.js';
    import { drafts, versions } from '@/stores/project.js';
    import { lt } from '@/modules/version.js';

    import { TextInput } from 'carbon-components-svelte';
    import WarningAltFilled from 'carbon-icons-svelte/lib/WarningAltFilled.svelte';
    import ArrowDown from 'carbon-icons-svelte/lib/ArrowDown.svelte';
    import ArrowUp from 'carbon-icons-svelte/lib/ArrowUp.svelte';
    import IncompleteWarning from 'carbon-icons-svelte/lib/IncompleteWarning.svelte';

    import SidebarLabel from '@/components/atoms/SidebarLabel.svelte';
    import ProgressBar from '@/components/atoms/ProgressBar.svelte';
    import TextureEditor from '@/components/editors/Texture.svelte';
    import ShaderEditor from '@/components/editors/Shader.svelte';

    const sortCollator = new Intl.Collator();

    let zipEntries = [];
    let filterSearch = '';

    const capabilities = [
        {
            test: ({ entryName: name }) => {
                if (!name.endsWith('.png')) {
                    return false;
                }

                if (name.includes('debug')) {
                    return false;
                }

                if (name.includes('fire_0') || name.includes('fire_1')) {
                    return false;
                }

                if (name.includes('block/nether_portal')) {
                    return false;
                }

                if (name.includes('block/water_')) {
                    return false;
                }

                if (name.includes('block/lava_')) {
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
            check: assetCheck,
            label: ({ entryName }) =>
                entryName.replace(/^assets\/minecraft\/textures\//, ''),
            open: ({ label, zipEntry }) =>
                openEditor({
                    ui: TextureEditor,
                    label,
                    zipEntry,
                }),
        },
        {
            test: ({ entryName: name }) => {
                if (!name.endsWith('.png')) {
                    return false;
                }

                if (name.includes('fire_0') || name.includes('fire_1')) {
                    return true;
                }

                if (name.includes('block/nether_portal')) {
                    return true;
                }

                if (name.includes('block/water_')) {
                    return true;
                }

                if (name.includes('block/lava_')) {
                    return true;
                }

                return false;
            },
            check: assetCheck,
            label: ({ entryName }) =>
                entryName.replace(/^assets\/minecraft\/textures\//, ''),
            open: ({ label, zipEntry }) =>
                openEditor({
                    ui: ShaderEditor,
                    label,
                    zipEntry,
                }),
        },
    ];

    function assetCheck({ entryName }) {
        return [
            !versions.has(entryName) ? 'version' : null,
            outdated(entryName) ? 'outdated' : null,
            fromFuture(entryName) ? 'fromFuture' : null,
            drafts.get(entryName, false) ? 'draft' : null,
        ].filter((d) => d !== null);
    }

    function outdated(filename) {
        return (
            versions.has(filename) &&
            lt(versions.get(filename), $selectedVersion)
        );
    }

    function fromFuture(filename) {
        return (
            versions.has(filename) &&
            lt($selectedVersion, versions.get(filename))
        );
    }

    function makeList() {
        zipEntries = [];

        if (!$selectedVersion) {
            return;
        }

        const { zip } = cachedVersions[$selectedVersion];

        zipEntries = zip
            .getEntries()
            .map((entry) => {
                for (const capability of capabilities) {
                    if (capability.test(entry)) {
                        const label = capability.label(entry);
                        const filename = entry.entryName;
                        const warnings = capability.check(entry);

                        return {
                            label,
                            warnings,
                            filename,
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

    $: makeList($selectedVersion);
    $: completedEntries = zipEntries.filter(
        ({ warnings }) => warnings.length === 0
    ).length;

    versions.subscribe(makeList);
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
                class:has-warning={entry.warnings.length > 0}
                class:hidden={!entry.label.includes(filterSearch)}
                on:click={entry.onClick}
            >
                <span>{entry.label}</span>

                {#if entry.warnings.includes('version')}
                    <WarningAltFilled />
                {:else if entry.warnings.includes('outdated')}
                    <ArrowDown />
                {:else if entry.warnings.includes('fromFuture')}
                    <ArrowUp />
                {:else if entry.warnings.includes('draft')}
                    <IncompleteWarning />
                {/if}
            </li>
        {/each}
    </ul>

    {#if $selectedVersion}
        <div class="motivation">
            <ProgressBar value={completedEntries} max={zipEntries.length} />
        </div>
    {/if}

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

    .motivation {
        flex: 0 1 auto;
        margin-top: var(--cds-spacing-02);
    }

    .form {
        flex: 0 1 auto;
        margin-top: var(--cds-spacing-02);
    }

    .entry {
        display: flex;
        flex-direction: row;
        align-items: center;

        cursor: pointer;

        color: var(--cds-interactive-02);
        margin: var(--cds-spacing-01) var(--cds-spacing-02)
            var(--cds-spacing-01) 0;

        &.has-warning {
            color: var(--cds-text-error);
        }

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
