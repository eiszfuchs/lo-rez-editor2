<script>
    import { minecraftVersions } from '@/stores/mc-versions.js';
    import { Select, SelectItem } from 'carbon-components-svelte';

    const { writeFileSync, mkdirSync } = require('fs');
    const path = require('path');
    const axios = require('axios').default;

    let selected;

    let pending = false;
    let progress = 1;

    $: loadVersion(selected);

    function fetchVersion(url, version) {
        pending = true;
        progress = 0;

        mkdirSync('versions', { recursive: true });

        axios
            .get(url, {
                onDownloadProgress: ({ loaded, total }) => {
                    progress = loaded / total;
                },
            })
            .then(({ data }) => {
                progress = 1;

                writeFileSync(`versions/${version}.jar`, data, {
                    encoding: 'binary',
                });
            })
            .finally(() => {
                pending = false;
            });
    }

    function loadVersion(version) {
        if (!version) {
            return;
        }

        const { url } = $minecraftVersions.find(({ id }) => id === version);

        axios
            .get(url)
            .then(({ data }) => data)
            .then(({ downloads }) => downloads)
            .then(({ client }) => client)
            .then(({ url }) => fetchVersion(url, version));
    }
</script>

<Select labelText="Master version" disabled={pending} bind:selected>
    <SelectItem text="Please select" />
    {#each $minecraftVersions as version}
        <SelectItem value={version.id} text={version.id} />
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
