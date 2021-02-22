<script>
    import CloneCheck from './sidebar/CloneCheck.svelte';
    import VersionsList from './sidebar/VersionsList.svelte';
    import AssetList from './sidebar/AssetList.svelte';
</script>

<div class="box">
    <CloneCheck />
</div>

<div class="box">
    <VersionsList />
</div>

<div class="box stretch">
    <AssetList />
</div>

<style lang="scss">
    .box {
        padding: var(--cds-spacing-03);
        background-color: var(--cds-field-01);

        + .box {
            margin-top: var(--cds-spacing-02);
        }

        &.stretch {
            flex: 1 1 auto;
            overflow: hidden;
        }
    }
</style>
