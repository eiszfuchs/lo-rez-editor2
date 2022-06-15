<script>
    import CloneCheck from './sidebar/CloneCheck.svelte';
    import VersionsList from './sidebar/VersionsList.svelte';
    import AssetList from './sidebar/AssetList.svelte';
    import SettingsPanel from './sidebar/SettingsPanel.svelte';
</script>

<aside>
    <div class="padded box">
        <CloneCheck />
    </div>

    <div class="padded box">
        <VersionsList />
    </div>

    <div class="padded box stretch">
        <AssetList />
    </div>

    <div class="box">
        <SettingsPanel />
    </div>
</aside>

<style lang="scss">
    aside {
        grid-area: aside;

        display: flex;
        flex-direction: column;
        gap: var(--cds-spacing-02);
    }

    .box {
        background-color: var(--cds-field-01);

        // To fix some visual issues with nested components that also use --cds-field-01:
        --cds-layer: var(--cds-field-02);

        &.padded {
            padding: var(--cds-spacing-03);
        }

        &.stretch {
            flex: 1 1 auto;
            overflow: hidden;
        }
    }
</style>
