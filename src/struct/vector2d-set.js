const is = (vectorA, vectorB) =>
    vectorA.x === vectorB.x && vectorA.y === vectorB.y;

export function VectorSet2D(vectors = []) {
    this.vectors = [];

    for (let vector of vectors) {
        this.add(vector);
    }

    return this;
}

VectorSet2D.prototype.has = function (vector2d) {
    for (let vector of this.vectors) {
        if (is(vector2d, vector)) {
            return true;
        }
    }

    return false;
};

VectorSet2D.prototype.add = function (vector2d) {
    if (!this.has(vector2d)) {
        this.vectors.push(vector2d);
    }

    return this;
};

VectorSet2D.prototype.delete = function (vector2d) {
    this.vectors = this.vectors.filter((vector) => !is(vector2d, vector));

    return this;
};

VectorSet2D.prototype.clear = function () {
    this.vectors = [];

    return this;
};

VectorSet2D.prototype.toArray = function () {
    return this.vectors;
};
