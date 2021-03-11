export const normalize = (version) => {
    const normalizedVersion = (version || '0.0').split('.');

    normalizedVersion[2] = normalizedVersion[2] || '0';

    return normalizedVersion.map((d) => parseInt(d, 10));
};

export const lt = (vA, vB) => {
    const [majorA, minorA, bugfixA = 0] = normalize(vA);
    const [majorB, minorB, bugfixB = 0] = normalize(vB);

    return majorA < majorB || minorA < minorB;
};
