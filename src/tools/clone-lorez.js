const { exec } = require('child_process');
const { resolve } = require('path');

const targetPath = './lo-rez/';
const targetAbsPath = resolve(targetPath);

export const cloneLorez = () =>
    new Promise((resolve, reject) => {
        exec(
            `git clone https://github.com/eiszfuchs/lo-rez "${targetAbsPath}"`,
            (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            }
        );
    });
