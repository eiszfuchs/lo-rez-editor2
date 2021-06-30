export const flatten = (nested) => nested.flat();

export const empty = (width, height, fill = null) =>
    Array(height)
        .fill(null)
        .map(() => Array(width).fill(fill));

export const copy = (source) => {
    const height = source?.length || 0;
    const width = source[0]?.length || 0;
    const clone = empty(width, height);

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            clone[y][x] = source[y][x];
        }
    }

    return clone;
};

export const wrap = (nested, size = 1) => {
    const result = [];
    let temp = [];

    nested.forEach((item) => {
        if (temp.length === size) {
            result.push(temp);
            temp = [];
        }

        temp.push(item);
    });

    if (temp.length) {
        result.push(temp);
    }

    return result;
};
