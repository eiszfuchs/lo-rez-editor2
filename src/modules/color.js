const { abs } = Math;

const fromHex = (color) =>
    color
        .match(/#(.{2})(.{2})(.{2})(.{2})/)
        .slice(1)
        .map((d) => parseInt(d, 16));

export const diff = (colorA, colorB) => {
    const [redA, greenA, blueA, alphaA] = fromHex(colorA);
    const [redB, greenB, blueB, alphaB] = fromHex(colorB);

    return (
        abs(redA - redB) +
        abs(greenA - greenB) +
        abs(blueA - blueB) +
        abs(alphaA - alphaB)
    );
};
