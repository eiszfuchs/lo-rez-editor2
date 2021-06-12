<script>
    import { cachedVersions, selectedVersion } from '@/stores/mc-versions.js';
    import { openEditor } from '@/stores/editors.js';
    import { drafts, versions } from '@/stores/project.js';
    import { filterWarnings } from '@/stores/search.js';
    import { lt } from '@/modules/version.js';

    import {
        Button,
        Checkbox,
        OverflowMenu,
        Search,
        TooltipIcon,
    } from 'carbon-components-svelte';
    import FilterEdit16 from 'carbon-icons-svelte/lib/FilterEdit16';

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
                            hide: false,
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

    function filterList(e) {
        let textFilter = '';

        if (e.target && e.target.type === 'text') {
            textFilter = e.target.value.trim();
        } else {
            textFilter = filterSearch;
        }

        zipEntries = zipEntries.map((entry) => {
            entry.hide = false;

            if (entry.warnings.length > 0) {
                const entryWarnings = [];

                for (const warning of entry.warnings) {
                    entryWarnings.push({
                        id: warning,
                        showEntries: $filterWarnings.find(
                            (w) => w.id === warning
                        ).showEntries,
                    });
                }

                entry.hide = !entryWarnings.filter((w) => w.showEntries).length;
            }

            entry.hide = entry.hide || !entry.label.includes(textFilter);

            return entry;
        });
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

        <div class="warnings-legend">
            <span>Legend:</span>

            {#each $filterWarnings as warning}
                <TooltipIcon
                    tooltipText={warning.label}
                    align="end"
                    style="cursor: default;"
                >
                    <svelte:component this={warning.iconComponent} />
                </TooltipIcon>
            {/each}
        </div>
    </SidebarLabel>

    <!-- This is the actual list -->
    <ul class="assets">
        {#each zipEntries as entry}
            <li
                class="entry"
                class:has-warning={entry.warnings.length > 0}
                class:hidden={entry.hide}
                on:click={entry.onClick}
            >
                <span>{entry.label}</span>

                <span class="warnings">
                    {#each $filterWarnings as warning}
                        {#if entry.warnings.includes(warning.id)}
                            <span
                                class="warning-icon"
                                class:disabled={!warning.showEntries}
                            >
                                <svelte:component
                                    this={warning.iconComponent}
                                />
                            </span>
                        {/if}
                    {/each}
                </span>
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
                on:clear={filterList}
                on:input={filterList}
            />
        </div>

        <!--
            overflow menu is cool, but is always an UL.
            original overflow menu items (LI) are ugly and unflexible,
            as they only really support plain text in them.
        -->
        <OverflowMenu
            id="filter-warnings"
            flipped
            light
            size="sm"
            direction="top"
        >
            <div slot="menu">
                <Button
                    size="small"
                    kind="ghost"
                    hasIconOnly="true"
                    tooltipPosition="top"
                    tooltipAlignment="end"
                    iconDescription="Filter by warnings"
                    disabled={!$selectedVersion}
                    icon={FilterEdit16}
                />
            </div>

            {#each $filterWarnings as _, i}
                <li class="filter-menu-item bx--overflow-menu-options__option">
                    <Checkbox
                        labelText={$filterWarnings[i].label}
                        bind:checked={$filterWarnings[i].showEntries}
                        on:check={filterList}
                    />
                </li>
            {/each}
        </OverflowMenu>
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

    .warnings-legend {
        display: inline-flex;
        float: right;

        span:first-child {
            margin-right: 1ch;
        }
    }

    .filter-menu-item {
        color: var(--cds-text-01);
        padding: 0;
        margin: 0;

        // :global(label) {
        //     width: 100%;
        //     padding: 0 var(--cds-spacing-02);
        // }
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

            .warning-icon {
                &.disabled {
                    color: var(--cds-interactive-02);
                    opacity: 0.5;
                }
            }
        }
    }
</style>
