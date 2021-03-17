const { abs } = Math;

const fromHex = (color) =>
    color
        .match(/#(.{2})(.{2})(.{2})(.{2})/)
        .slice(1)
        .map((d) => parseInt(d, 16));

const isTransparent = (color) => fromHex(color)[3] < 255;

// Lower is better
const sortScore = (colorIterable) => {
    const colors = [...colorIterable];

    let score = 0;
    let prevColor = colors[0];

    for (let i = 1; i < colors.length; i += 1) {
        score += diff(prevColor, colors[i]);
        prevColor = colors[i];
    }

    return score;
};

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

export const sort = (colorIterable) => {
    const colors = new Set(colorIterable);
    const variantScores = {};

    // Nearest neighbour (to save time/complexity)
    for (const firstColor of colors) {
        const candidates = new Set(colors);
        const sorted = [firstColor];

        candidates.delete(firstColor);

        while (candidates.size > 0) {
            let minDistance = Number.MAX_SAFE_INTEGER;
            let nextNeighbour = null;
            for (const color of candidates) {
                const dist = diff(sorted[sorted.length - 1], color);

                if (dist < minDistance) {
                    nextNeighbour = color;
                    minDistance = dist;
                }
            }

            sorted.push(nextNeighbour);
            candidates.delete(nextNeighbour);
        }

        variantScores[firstColor] = {
            sorted,
            score: sortScore(sorted),
        };
    }

    const minScore = Math.min(
        ...Object.values(variantScores).map(({ score }) => score)
    );

    return Object.entries(variantScores).find(
        ([, { score }]) => score === minScore
    )[1].sorted;
};
