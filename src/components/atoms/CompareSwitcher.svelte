<script>
    import { key } from './compare';
    import { setContext } from 'svelte';

    let tabs = [];

    setContext(key, {
        register: (tab) => {
            const initialized = tabs.length > 0;

            tabs = [...tabs, tab];
            if (!initialized) {
                activate(tab);
            }
        },
    });

    function activate(tab) {
        tabs.forEach((t) => {
            if (t === tab) {
                t.activate();
                t.active = true;
            } else {
                t.deactivate();
                t.active = false;
            }
        });

        tabs = tabs;
    }
</script>

<nav>
    {#each tabs as tab}
        <span
            class="tab"
            class:active={tab.active}
            on:click={() => activate(tab)}
        >
            {tab.label}
        </span>
    {/each}
</nav>

<slot />

<style lang="scss">
    nav {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cds-spacing-01);
    }

    .tab {
        font-size: var(--cds-label-01-font-size, 0.875rem);

        background-color: var(--cds-field-01);
        padding-top: var(--cds-spacing-02);
        padding-right: var(--cds-spacing-04);
        padding-bottom: var(--cds-spacing-02);
        padding-left: var(--cds-spacing-03);

        opacity: 0.5;
        cursor: pointer;

        &:hover {
            background-color: var(--cds-hover-field);
        }

        &.active {
            opacity: 1;
        }
    }
</style>
