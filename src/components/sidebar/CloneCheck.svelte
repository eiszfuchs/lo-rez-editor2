<script>
    import { gitVersion } from '@/stores/git-version.js';
    import { lorezVersion } from '@/stores/lorez-version.js';

    import { cloneLorez } from '@/tools/clone-lorez.js';

    import { InlineNotification } from 'carbon-components-svelte';
    import { Button } from 'carbon-components-svelte';
    import { InlineLoading } from 'carbon-components-svelte';
    import SidebarLabel from '@/components/atoms/SidebarLabel.svelte';

    let pending = false;

    function onCloneClick() {
        pending = true;

        cloneLorez()
            .then(() => location.reload())
            .catch(console.error)
            .finally(() => {
                pending = false;
            });
    }
</script>

<SidebarLabel>lo-rez version</SidebarLabel>

{#if $lorezVersion}
    <p>Revision: <code>{$lorezVersion}</code></p>
{:else}
    <InlineNotification
        title="lo-rez has not been cloned."
        subtitle={$gitVersion
            ? 'However, it can be cloned automatically.'
            : 'You must install git and clone it yourself.'}
        kind="warning"
        lowContrast={false}
        hideCloseButton={true}
    />

    {#if $gitVersion}
        <div class="clone-action">
            <p>Clone lo-rez automatically?</p>

            {#if pending}
                <InlineLoading description="Cloning&hellip;" />
            {:else}
                <Button
                    size="small"
                    kind="primary"
                    disabled={pending}
                    on:click={onCloneClick}
                >
                    Clone
                </Button>
            {/if}
        </div>
    {/if}
{/if}

<style lang="scss">
    p {
        white-space: nowrap;

        font-size: var(--cds-label-01-font-size);
        font-weight: var(--cds-label-01-font-weight);
        line-height: var(--cds-label-01-line-height);
        letter-spacing: var(--cds-label-01-letter-spacing);
    }

    .clone-action {
        display: flex;
        align-items: center;
        gap: var(--cds-spacing-03);
    }
</style>
