<script>
    import { key } from './compare';
    import { getContext } from 'svelte';

    export let label;
    let active = false;

    const { register } = getContext(key);

    function activate() {
        active = true;
    }

    function deactivate() {
        active = false;
    }

    register({ label, activate, deactivate });
</script>

<div class:active>
    <slot />
</div>

<style lang="scss">
    div {
        position: relative;
        background-color: var(--cds-field-01);

        flex: 1 0 auto;
        min-height: 1px;
    }

    div:not(.active) {
        display: none;
    }
</style>
