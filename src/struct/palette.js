import { diff, sortNearest } from '@/modules/color.js';

export function Palette(colors = []) {
    this.subscriptions = new Set();
    this.colorWeights = {};
    this.colorReplacements = {};

    this.colors = new Set(colors);
    this.index = 0;

    // Colors without cleanup (for recovery)
    this.rawColors = new Set(colors);

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

Palette.prototype.replaceColor = function (color, replacement) {
    if (color === replacement) {
        return;
    }

    const weight = this.colorWeights[color];
    const rDiff = diff(color, replacement);

    console.debug('%d x %s -(±%d)-> %s', weight, color, rDiff, replacement);

    this.colorReplacements[color] = replacement;
    this.colors.delete(color);
    this.colors.add(replacement);
};

Palette.prototype.cleanupNearest = function () {
    for (let colorA of this.colors) {
        let minDiff = Number.MAX_SAFE_INTEGER;
        let sibling = null;

        const weightA = this.colorWeights[colorA];

        if (weightA > 8) {
            continue;
        }

        for (let colorB of this.colors) {
            if (colorA === colorB) {
                continue;
            }

            const weightB = this.colorWeights[colorB];
            if (weightB <= 8) {
                continue;
            }

            const difference = diff(colorA, colorB);
            if (difference < minDiff) {
                minDiff = difference;
                sibling = colorB;
            }
        }

        if (minDiff >= 12) {
            continue;
        }

        this.replaceColor(colorA, sibling);
    }
};

Palette.prototype.cleanupMedian = function () {
    let groupStart = null;
    let group = [];
    const sortedColors = sortNearest([...this.colors]);

    for (let color of sortedColors) {
        if (groupStart === null) {
            groupStart = color;
            group = [groupStart];
            continue;
        }

        const difference = diff(groupStart, color);
        if (difference > 16) {
            if (group.length > 1) {
                const median = group[Math.floor(group.length / 2)];

                for (let colorB of group) {
                    this.replaceColor(colorB, median);
                }
            }

            groupStart = color;
            group = [groupStart];
        } else {
            group.push(color);
        }
    }
};

Palette.prototype.cleanup = function () {
    if (this.colors.size < 8) {
        console.debug('Will not clean up palettes with less than 8 colors');

        return this.notify();
    }

    console.debug(`Palette size before cleanup = ${this.colors.size}`);
    console.groupCollapsed('Palette cleanup');
    console.debug(this.colorWeights);

    const uniqueColors = [...this.colors].filter(
        (color) => this.colorWeights[color] <= 1
    );

    if (uniqueColors.length > 24) {
        console.warn(
            'More than 24 colors are used only once, forcing median cleanup'
        );

        this.cleanupMedian();
    } else {
        this.cleanupNearest();
    }

    console.groupEnd();
    console.debug(`Palette size after cleanup = ${this.colors.size}`);

    return this.notify();
};

Palette.prototype.addColor = function (color) {
    if (color.match(/^#[a-f0-9]{8}$/i) === null) {
        throw new Error(`Color ${color} is not in the correct format`);
    }

    this.colors.add(color);
    this.rawColors.add(color);
    this.colorWeights[color] = (this.colorWeights[color] || 0) + 1;

    return this.notify();
};

Palette.prototype.setColor = function (color) {
    this.index = this.findIndex(color);

    return this.notify();
};

Palette.prototype.setIndex = function (index) {
    if (index < 0 || index >= this.colors.size) {
        throw new Error(`Palette index ${index} out of range`);
    }

    this.index = index;

    return this.notify();
};

Palette.prototype.findIndex = function (color, tolerance = 0) {
    if (!this.colors.has(color)) {
        if (this.colorReplacements[color]) {
            return this.findIndex(this.colorReplacements[color]);
        }

        if (tolerance > 0) {
            let minDiff = Number.MAX_SAFE_INTEGER;
            let bestCandidate = null;

            for (let colorB of this.colors) {
                const difference = diff(color, colorB);
                if (difference < minDiff && difference <= tolerance) {
                    minDiff = difference;
                    bestCandidate = colorB;
                }
            }

            if (bestCandidate !== null) {
                return this.findIndex(bestCandidate);
            }
        }

        throw new Error(`Color ${color} is not in palette`);
    }

    return this.toArray().indexOf(color);
};

Palette.prototype.recoverIndex = function (rawIndex) {
    if (rawIndex < 0 || rawIndex >= this.rawColors.size) {
        throw new Error(`Palette legacy index ${rawIndex} out of range`);
    }

    return this.findIndex([...this.rawColors][rawIndex]);
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
