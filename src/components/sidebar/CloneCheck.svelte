<script>
    import { InlineNotification } from 'carbon-components-svelte';
    import { Button } from 'carbon-components-svelte';
    import { InlineLoading } from 'carbon-components-svelte';
    import DrillDown16 from 'carbon-icons-svelte/lib/DrillDown16';

    import { Palette } from '@/struct/palette.js';

    import { gitVersion } from '@/stores/git-version.js';
    import { lorezVersion } from '@/stores/lorez-version.js';
    import { cachedVersions, selectedVersion } from '@/stores/mc-versions.js';

    import { cloneLorez } from '@/tools/clone-lorez.js';

    import { wrap } from '@/modules/texture.js';
    import { load } from '@/modules/issues.js';
    import { paint } from '@/modules/extractor.js';
    import { lt } from '@/modules/version.js';

    import SidebarLabel from '@/components/atoms/SidebarLabel.svelte';

    const { writeFileSync } = require('fs');

    let pending = false;

    function onExportClick() {
        const { zip } = cachedVersions[$selectedVersion];

        zip.getEntries().forEach(({ entryName }) => {
            try {
                const [version, palette, texture] = load(entryName);

                if (lt(version, $selectedVersion)) {
                    return;
                }

                const exportFilename = `lo-rez/${entryName}`;
                const texturePalette = new Palette(palette);
                const wrappedTexture = wrap(texture, 8);
                const painted = paint(wrappedTexture, texturePalette);
                const cropped = painted.slice(painted.indexOf('base64,') + 7);
                const buffer = atob(cropped);

                console.debug(`Writing data to ${exportFilename}`);

                writeFileSync(exportFilename, buffer, { encoding: 'binary' });
            } catch (reason) {}
        });
    }

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
    <div class="layout">
        <div>
            <SidebarLabel>lo-rez version</SidebarLabel>

            <p>Revision: <code>{$lorezVersion}</code></p>
        </div>

        <Button
            size="small"
            kind="tertiary"
            icon={DrillDown16}
            disabled={!$selectedVersion}
            on:click={onExportClick}
        >
            Export
        </Button>
    </div>
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
        <div class="layout">
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

    .layout {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--cds-spacing-03);
    }
</style>
