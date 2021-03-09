const { existsSync, readFileSync, writeFileSync } = require('fs');

const JSONL_SEPARATOR = '\n';

export function ProjectFile(filename) {
    if (!filename) {
        throw new Error('Must provide filename');
    }

    this.filename = filename;
    this.data = {};

    return this.read();
}

ProjectFile.prototype.has = function (name) {
    return Object.keys(this.data).includes(name);
};

ProjectFile.prototype.get = function (name) {
    if (!this.has(name)) {
        return null;
    }

    return this.data[name];
};

ProjectFile.prototype.read = function () {
    this.data = {};

    if (!existsSync(this.filename)) {
        return this;
    }

    const buffer = readFileSync(this.filename, { encoding: 'utf-8' });
    const lines = String(buffer).split(JSONL_SEPARATOR);

    lines
        .filter((d) => !!d)
        .map(JSON.parse)
        .forEach(({ name, value }) => (this.data[name] = value));

    return this;
};
