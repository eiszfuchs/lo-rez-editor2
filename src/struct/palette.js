export function Palette(colors = []) {
    this.subscriptions = new Set();
    this.colorWeights = {};

    this.colors = new Set(colors);
    this.index = 0;

    return this;
}

Palette.prototype.toArray = function () {
    return [...this.colors];
};

Palette.prototype.subscribe = function (callback) {
    this.subscriptions.add(callback);

    return () => {
        this.subscriptions.delete(callback);
    };
};

Palette.prototype.notify = function () {
    this.subscriptions.forEach((callback) => {
        callback(this);
    });

    return this;
};

Palette.prototype.cleanup = function () {
    // TODO: A certain amount of colors might be too much, cleanup in this case
    console.debug('TODO: Palette cleanup? size =', this.colors.size);

    return this.notify();
};

Palette.prototype.addColor = function (color) {
    if (color.match(/^#[a-f0-9]{8}$/i) === null) {
        throw new Error(`Color ${color} is not in the correct format`);
    }

    this.colors.add(color);
    this.colorWeights[color] = (this.colorWeights[color] || 0) + 1;

    return this.notify();
};

Palette.prototype.setColor = function (color) {
    if (!this.colors.has(color)) {
        throw new Error(`Color ${color} is not in palette`);
    }

    this.index = this.toArray().indexOf(color);

    return this.notify();
};

Palette.prototype.setIndex = function (index) {
    if (index < 0 || index >= this.colors.size) {
        throw new Error(`Palette index ${index} out of range`);
    }

    this.index = index;

    return this.notify();
};

Palette.prototype.getDefault = function () {
    let defaultIndex = 0;
    let maxWeight = 0;

    for (let color of this.colors) {
        if (color.endsWith('00')) {
            return this.toArray().indexOf(color);
        }

        const weight = this.colorWeights[color];

        if (weight > maxWeight) {
            defaultIndex = this.toArray().indexOf(color);
            maxWeight = weight;
        }
    }

    return defaultIndex;
};
