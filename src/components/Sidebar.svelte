<script>
    import CloneCheck from './sidebar/CloneCheck.svelte';
    import VersionsList from './sidebar/VersionsList.svelte';
    import AssetList from './sidebar/AssetList.svelte';
</script>

<aside>
    <div class="box">
        <CloneCheck />
    </div>

    <div class="box">
        <VersionsList />
    </div>

    <div class="box stretch">
        <AssetList />
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
        padding: var(--cds-spacing-03);
        background-color: var(--cds-field-01);

        &.stretch {
            flex: 1 1 auto;
            overflow: hidden;
        }
    }
</style>
