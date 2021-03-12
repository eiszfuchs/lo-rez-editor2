<script>
    import {
        minecraftVersions,
        downloadedVersions,
        selectedVersion,
    } from '@/stores/mc-versions.js';

    import { editors } from '@/stores/editors.js';

    import { Select, SelectItem } from 'carbon-components-svelte';
    import SidebarLabel from '@/components/atoms/SidebarLabel.svelte';

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
    <div class="progress">
        <b class="progress__bar" style="width: {progress * 100}%;" />
    </div>
{/if}

<style lang="scss">
    .progress {
        margin-top: var(--cds-spacing-01);
        margin-bottom: var(--cds-spacing-01);

        display: block;
        width: 100%;
        height: 2px;
        position: relative;

        background-color: var(--cds-ui-03);

        &__bar {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;

            background-color: var(--cds-interactive-04);
        }
    }
</style>
