export function Palette(colors) {
    this.subscriptions = new Set();

    this.colors = new Set(colors);
    this.index = 0;

    return this;
}

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

Palette.prototype.setColor = function (color) {
    // TODO: Validate input
    this.index = [...this.colors].indexOf(color);

    return this.notify();
};

Palette.prototype.setIndex = function (index) {
    // TODO: Validate input
    this.index = index;

    return this.notify();
};
