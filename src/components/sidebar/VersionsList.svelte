<script>
    import {
        minecraftVersions,
        downloadedVersions,
        selectedVersion,
    } from '@/stores/mc-versions.js';

    import { editors } from '@/stores/editors.js';

    import { Select, SelectItem } from 'carbon-components-svelte';
    import SidebarLabel from '@/components/atoms/SidebarLabel.svelte';
    import ProgressBar from '@/components/atoms/ProgressBar.svelte';

    const { writeFileSync, mkdirSync, existsSync } = require('fs');
    const axios = require('axios').default;

    let selected;

    let pending = false;
    let progress = 1;

    $: hasOpenEditors = $editors.length > 0;
    $: loadVersion(selected);

    function fetchVersion(url, version) {
        const targetFilename = `versions/${version}.jar`;

        if (existsSync(targetFilename)) {
            $selectedVersion = version;
            console.debug(
                `Selected version already exists in ${targetFilename}`
            );

            return Promise.resolve();
        }

        pending = true;
        progress = 0;

        mkdirSync('versions', { recursive: true });
        console.debug(`Loading selected version from ${url}`);

        axios
            .get(url, {
                // This is important:
                responseType: 'arraybuffer',
                onDownloadProgress: ({ loaded, total }) => {
                    progress = loaded / total;
                },
            })
            .then(({ data }) => {
                progress = 1;

                // Buffer.from is also important
                // (don't waste your time like I did)
                writeFileSync(targetFilename, Buffer.from(data), {
                    encoding: 'binary',
                });
            })
            .finally(() => {
                pending = false;
                $selectedVersion = version;
            });
    }

    function loadVersion(version) {
        $selectedVersion = null;

        if (!version) {
            return;
        }

        // TODO: Don't make a request when the file already exists

        const { url } = $minecraftVersions.find(({ id }) => id === version);

        console.debug(`Loading version information from ${url}`);

        axios
            .get(url)
            .then(({ data }) => data?.downloads?.client)
            .then(({ url }) => fetchVersion(url, version));
    }
</script>

<SidebarLabel>Minecraft version</SidebarLabel>

<!-- TODO: <Dropdown> looks nicer, maybe try this later? -->
<Select
    light
    hideLabel
    size="sm"
    disabled={pending || hasOpenEditors}
    bind:selected
>
    <SelectItem text="Please select" />

    {#each $minecraftVersions as version}
        <SelectItem
            value={version.id}
            text="{version.id} {$downloadedVersions.includes(version.id)
                ? '(✓ cached)'
                : ''}"
        />
    {/each}
</Select>

{#if pending}
    <div class="spacer" />

    <ProgressBar value={progress} max={1} />
{/if}

<style lang="scss">
    .spacer {
        height: var(--cds-spacing-02);
    }
</style>
