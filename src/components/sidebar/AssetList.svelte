<script>
    import { cachedVersions, selectedVersion } from '@/stores/mc-versions.js';
    import { openEditor } from '@/stores/editors.js';
    import { drafts, versions } from '@/stores/project.js';
    import { lt } from '@/modules/version.js';

    import SidebarLabel from '@/components/atoms/SidebarLabel.svelte';
    import ProgressBar from '@/components/atoms/ProgressBar.svelte';
    import TextureEditor from '@/components/editors/Texture.svelte';
    import ShaderEditor from '@/components/editors/Shader.svelte';

    import { Search, TooltipIcon } from 'carbon-components-svelte';
    import CheckmarkFilled16 from 'carbon-icons-svelte/lib/CheckmarkFilled16';
    import WarningAltFilled16 from 'carbon-icons-svelte/lib/WarningAltFilled16';
    import ArrowDown16 from 'carbon-icons-svelte/lib/ArrowDown16';
    import ArrowUp16 from 'carbon-icons-svelte/lib/ArrowUp16';
    import IncompleteWarning16 from 'carbon-icons-svelte/lib/IncompleteWarning16';

    const sortCollator = new Intl.Collator();

    let zipEntries = [];

    let filterSearch = '';
    let filterWarnings = new Set();

    const warnings = [
        {
            id: 'none',
            label: 'Done',
            iconComponent: CheckmarkFilled16,
        },
        {
            id: 'version',
            label: 'To do',
            iconComponent: WarningAltFilled16,
        },
        {
            id: 'outdated',
            label: 'Outdated',
            iconComponent: ArrowDown16,
        },
        {
            id: 'fromFuture',
            label: 'Future',
            iconComponent: ArrowUp16,
        },
        {
            id: 'draft',
            label: 'Draft',
            iconComponent: IncompleteWarning16,
        },
    ];

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
            check: ({ entryName }) =>
                [
                    !versions.has(entryName) ? 'version' : null,
                    outdated(entryName) ? 'outdated' : null,
                    fromFuture(entryName) ? 'fromFuture' : null,
                    drafts.get(entryName, false) ? 'draft' : null,
                ].filter((d) => d !== null),
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

                if (name.includes('block/water_')) {
                    return true;
                }

                if (name.includes('block/lava_')) {
                    return true;
                }

                return false;
            },
            check: ({ entryName }) =>
                [
                    !versions.has(entryName) ? 'version' : null,
                    outdated(entryName) ? 'outdated' : null,
                    fromFuture(entryName) ? 'fromFuture' : null,
                    drafts.get(entryName, false) ? 'draft' : null,
                ].filter((d) => d !== null),
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

    function outdated(filename) {
        return lt(versions.get(filename), $selectedVersion);
    }

    function fromFuture(filename) {
        return lt($selectedVersion, versions.get(filename));
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

    function entryFilter(entry) {
        return [
            // search input filter
            !entry.label.includes(filterSearch),
            // "done" filter
            !entry.warnings.length && filterWarnings.has('none'),
            // warnings filter
            entry.warnings.some((w) => filterWarnings.has(w)),
        ].filter((active) => active).length;
    }

    function toggleFilterWarnings(e) {
        const warningIdExists = (match) =>
            warnings.filter(({ id }) => id === match).length;

        const emergencyBreak = (tries) => {
            if (tries >= 5) {
                throw TypeError(
                    `Couldn't find a valid element after ${tries} tries.`
                );
            }
        };

        let filterId = '';
        let element = e.target;
        let button = element;
        let tries = 0;

        // grab the warning id from wherever it might hide
        while (!warningIdExists(element.id || '') && !emergencyBreak(tries)) {
            element = element.parentElement;
        }

        filterId = element.id || element.getAttribute('aria-describedby');

        // find the button to remove ugly active/focus state when clicked.
        // otherwise the tooltip will stay open after clicking.
        tries = 0;

        while (button.localName !== 'button' && !emergencyBreak(tries)) {
            button = button.parentElement;
        }

        if (button.localName === 'button') {
            button.blur();
        }

        if (filterWarnings.size === filterWarnings.add(filterId).size) {
            filterWarnings.delete(filterId);
        }

        filterWarnings = filterWarnings;
    }

    $: makeList($selectedVersion);
    $: completedEntries = zipEntries.filter(
        ({ warnings }) => warnings.length === 0
    ).length;
    $: filterSearch = filterSearch.trim();

    versions.subscribe(makeList);
</script>

<div class="layout">
    <SidebarLabel>
        Asset list

        {#if $selectedVersion}
            ({$selectedVersion})

            <span class="legend">
                {#each warnings as warning}
                    <TooltipIcon tooltipText={warning.label} align="end">
                        <span
                            id={warning.id}
                            class:active={filterWarnings.has(warning.id)}
                            on:click={toggleFilterWarnings}
                        >
                            <svelte:component this={warning.iconComponent} />
                        </span>
                    </TooltipIcon>
                {/each}
            </span>
        {/if}
    </SidebarLabel>

    <!-- This is the actual list -->
    <ul class="assets">
        {#each zipEntries as entry}
            <li
                class="entry"
                class:has-warning={entry.warnings.length > 0}
                class:hidden={entryFilter(entry, [
                    // trigger reactivity :(
                    filterSearch,
                    filterWarnings,
                ])}
                on:click={entry.onClick}
            >
                <span>{entry.label}</span>

                {#if entry.warnings.length > 0}
                    <span class="warnings">
                        {#each warnings as { id, iconComponent }}
                            {#if entry.warnings.includes(id)}
                                <span class:active={filterWarnings.has(id)}>
                                    <svelte:component this={iconComponent} />
                                </span>
                            {/if}
                        {/each}
                    </span>
                {/if}
            </li>
        {/each}
    </ul>

    <div class="motivation">
        <ProgressBar value={completedEntries} max={zipEntries.length} />
    </div>

    <div class="form">
        <div class="search-input">
            <Search
                light
                size="sm"
                placeholder="Filter by name..."
                disabled={!$selectedVersion}
                autocomplete="on"
                bind:value={filterSearch}
            />
        </div>
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
        margin-top: var(--cds-spacing-02);
    }

    .form {
        display: flex;
        margin-top: var(--cds-spacing-02);
    }

    .search-input {
        flex-grow: 1;
        width: auto;
    }

    .legend {
        display: inline-flex;
        gap: var(--cds-spacing-02);
        float: right;

        margin-right: var(--cds-spacing-04);

        span {
            &.active {
                --cds-icon-secondary: var(--cds-text-error);
            }
        }
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
            width: 100%;
            flex: 1 1 auto;

            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            font-size: var(--cds-label-01-font-size);
            font-weight: var(--cds-label-01-font-weight);
            line-height: var(--cds-label-01-line-height);
            letter-spacing: var(--cds-label-01-letter-spacing);
        }

        > .warnings {
            min-width: fit-content;
            width: 0;

            line-height: 0;
        }
    }
</style>
