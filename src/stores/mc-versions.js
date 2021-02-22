import { readable, writable } from 'svelte/store';

let initialized = false;
const versionsUrl =
    'https://launchermeta.mojang.com/mc/game/version_manifest.json';

export const minecraftVersions = readable([], (set) => {
    if (initialized === false) {
        initialized = true;

        fetch(versionsUrl)
            .then((d) => d.json())
            .then(({ versions }) =>
                versions.filter(({ type }) => type === 'release')
            )
            .then(set);
    }

    return () => {};
});

export const selectedVersion = writable(null);
