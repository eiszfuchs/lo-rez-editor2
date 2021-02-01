import { readable } from 'svelte/store';

const { exec } = require('child_process');

let initialized = false;

export const gitVersion = readable(null, (set) => {
    if (initialized === false) {
        initialized = true;

        exec('git --version', (error, stdout) => {
            if (error) {
                // git not installed
                return;
            }

            console.debug(stdout);

            const output = String(stdout).trim();
            const versionResult = output.match(/^git version ([0-9.]+)$/i);

            if (versionResult) {
                set(versionResult[1]);
            }
        });
    }

    return () => {};
});
