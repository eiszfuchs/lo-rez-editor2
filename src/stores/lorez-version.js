import { readable } from 'svelte/store';

const { existsSync } = require('fs');
const { resolve } = require('path');
const { exec } = require('child_process');

let initialized = false;

const targetPath = './lo-rez/.git';
const targetAbsPath = resolve(targetPath);

export const lorezVersion = readable(null, (set) => {
    if (initialized === false) {
        initialized = true;

        console.debug(`Checking for repository at ${targetAbsPath}`);
        if (existsSync(targetAbsPath)) {
            exec(
                'git rev-parse --short HEAD',
                {
                    cwd: targetAbsPath,
                },
                (error, stdout) => {
                    if (error) {
                        return;
                    }

                    console.debug(stdout);

                    set(String(stdout).trim());
                }
            );
        }
    }

    return () => {};
});
