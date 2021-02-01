<script>
    import { gitVersion } from '@/stores/git-version.js';
    import { lorezVersion } from '@/stores/lorez-version.js';

    import { cloneLorez } from '@/tools/clone-lorez.js';

    import { InlineNotification } from 'carbon-components-svelte';
    import { Button } from 'carbon-components-svelte';
    import { Loading } from 'carbon-components-svelte';

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

{#if $lorezVersion}
    <p>Version of lo-rez: <code>{$lorezVersion}</code></p>
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

            <Button
                size="small"
                kind="primary"
                disabled={pending}
                on:click={onCloneClick}
            >
                Clone
            </Button>

            {#if pending}
                <!-- TODO: https://carbon-svelte.vercel.app/components/InlineLoading -->
                <div class="clone-loader">
                    <Loading withOverlay={false} small />
                </div>
            {/if}
        </div>
    {/if}
{/if}

<style lang="scss">
    p {
        font-size: var(--cds-label-01-font-size);
        font-weight: var(--cds-label-01-font-weight);
        line-height: var(--cds-label-01-line-height);
        letter-spacing: var(--cds-label-01-letter-spacing);
    }

    .clone-action {
        display: flex;
        align-items: baseline;
        gap: var(--cds-spacing-04);
    }

    .clone-loader {
        align-self: center;
    }
</style>
