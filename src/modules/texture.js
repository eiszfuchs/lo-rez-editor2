export const empty = (width, height, fill = null) =>
    Array(height)
        .fill(null)
        .map(() => Array(width).fill(fill));

export const flatten = (nested) => nested.flat();

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
