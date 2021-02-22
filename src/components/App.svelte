<script>
    import Sidebar from './Sidebar.svelte';
</script>

<aside>
    <Sidebar />
</aside>

<style lang="scss">
    aside {
        grid-area: aside;

        // TODO: Non-ideal separation
        display: flex;
        flex-direction: column;
    }
</style>
