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

ProjectFile.prototype.get = function (name, fallback = null) {
    if (!this.has(name)) {
        return fallback;
    }

    return this.data[name];
};

ProjectFile.prototype.read = function () {
    this.data = {};

    if (!existsSync(this.filename)) {
        return this;
    }

    console.debug(`Reading project file from ${this.filename}`);

    const buffer = readFileSync(this.filename, { encoding: 'utf-8' });
    const lines = String(buffer).split(JSONL_SEPARATOR);

    lines
        .filter((d) => !!d)
        .map(JSON.parse)
        .forEach(({ name, value }) => (this.data[name] = value));

    return this;
};

ProjectFile.prototype.set = function (name, value) {
    this.data[name] = value;

    return this.write();
};

ProjectFile.prototype.write = function () {
    console.debug(`Writing project file to ${this.filename}`);

    const buffer = Object.keys(this.data)
        .sort()
        .map((name) =>
            JSON.stringify({
                name,
                value: this.data[name],
            })
        )
        .join(JSONL_SEPARATOR);

    // Write with trailing new line
    writeFileSync(this.filename, `${buffer}\n`, { encoding: 'utf-8' });

    return this;
};
