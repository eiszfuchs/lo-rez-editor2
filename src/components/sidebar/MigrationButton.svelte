<script>
    import { selectedVersion, cachedVersions } from '@/stores/mc-versions.js';

    import { extract } from '@/modules/extractor.js';
    import { versions } from '@/stores/project.js';
    import { editors } from '@/stores/editors.js';
    import { load } from '@/modules/issues.js';
    import { lt } from '@/modules/version.js';

    import { Button, Modal } from 'carbon-components-svelte';
    import ArrowDown from 'carbon-icons-svelte/lib/ArrowDown.svelte';
    import Migrate from 'carbon-icons-svelte/lib/Migrate.svelte';

    let openMigrate = false;

    $: hasOpenEditors = $editors.length > 0;
    $: canMigrate =
        $selectedVersion &&
        cachedVersions[$selectedVersion]?.zip
            .getEntries()
            .some(({ entryName }) =>
                lt(versions.get(entryName), $selectedVersion)
            );

    const dataUriPrefix = 'data:image/png;base64,';

    const dataToUri = (data) =>
        !data ? null : dataUriPrefix + btoa(data.toString('binary') || '');

    function onMigrateClick() {
        openMigrate = true;
    }

    function doMigration() {
        const { zip } = cachedVersions[$selectedVersion];

        zip.getEntries().forEach(({ entryName, getData }) => {
            if (!entryName.startsWith('assets/minecraft')) {
                return;
            }

            try {
                const [, version, savedPalette] = load(entryName);

                if (!lt(version, $selectedVersion)) {
                    return;
                }

                extract(dataToUri(getData()), ({ palette }) => {
                    if (
                        savedPalette.join(':') === palette.toArray().join(':')
                    ) {
                        console.debug(
                            `Upgrading ${entryName}, since palettes match`
                        );
                        versions.set(entryName, $selectedVersion);
                    }
                });
            } catch (reason) {}
        });

        openMigrate = false;
    }
</script>

<Button
    size="sm"
    kind="tertiary"
    disabled={hasOpenEditors || !canMigrate}
    icon={Migrate}
    iconDescription="Migrate"
    on:click={onMigrateClick}
/>

<Modal
    danger
    size="sm"
    modalHeading="Migrate assets"
    primaryButtonText="Migrate"
    secondaryButtonText="Cancel"
    bind:open={openMigrate}
    on:click:button--secondary={() => (openMigrate = false)}
    on:submit={doMigration}
>
    <p>
        This will go through <ArrowDown /> outdated assets and set their asset version
        to <code>{$selectedVersion}</code>. It will take a lot of resources and
        the application may seem unresponsive for a while.
    </p>
    <p>
        The migration process will only upgrade versions if there were no
        changes since the last edit.
    </p>
    <br />
    <p>
        <strong>Please note:</strong> This will only work for assets that have been
        previously saved with this editor and have palette information available.
    </p>
</Modal>
