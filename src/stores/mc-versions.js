import { readable, writable } from 'svelte/store';
import { compare, lt } from '@/modules/version.js';

const { readdirSync } = require('fs');
const AdmZip = require('adm-zip');

let remoteInitialized = false;
let localInitialized = false;

const versionsUrl =
    'https://launchermeta.mojang.com/mc/game/version_manifest.json';

export const selectedVersion = writable(null);

export const cachedVersions = {};

export const minecraftVersions = readable([], (set) => {
    if (remoteInitialized === false) {
        remoteInitialized = true;

        console.debug(`Loading available versions from ${versionsUrl}`);

        fetch(versionsUrl)
            .then((d) => d.json())
            .then(({ versions }) =>
                versions
                    .filter(({ type }) => type === 'release')
                    .filter(({ id }) => lt('1.5', id))
            )
            .then(set);
    }

    return () => {};
});

export const downloadedVersions = readable([], (set) => {
    const update = () => {
        console.debug('Checking for cached versions');

        // Doing this synchronously will initialize the Zip instance before
        // the asset list will be updated
        const filenames = readdirSync('versions/');
        const versions = filenames
            .filter((d) => d.endsWith('.jar'))
            .map((d) => d.replace(/\.jar$/, ''))
            .sort(compare);

        set(versions);

        versions.forEach((version) => {
            if (!cachedVersions[version]) {
                console.debug(`Pre-loading ${version}.jar`);

                const zip = new AdmZip(`versions/${version}.jar`);

                // Load into memory to reduce UI freezes (and consume more RAM)
                zip.getEntry('pack.png');

                cachedVersions[version] = {
                    zip,
                };
            }
        });
    };

    if (localInitialized === false) {
        localInitialized = true;

        // Subscription already triggers the update apparently
        selectedVersion.subscribe(update);
        // update();
    }

    return () => {};
});
