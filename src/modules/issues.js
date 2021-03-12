import { palettes, textures, versions } from '@/stores/project.js';
import { lt } from '@/modules/version.js';

export const load = (entryName) => {
    if (!textures.has(entryName)) {
        throw new Error(`Could not find ${entryName} in textures`);
    }

    if (!versions.has(entryName)) {
        throw new Error(`Could not find ${entryName} in versions`);
    }

    if (!palettes.has(entryName)) {
        throw new Error(`Could not find ${entryName} in palettes`);
    }

    const texture = textures.get(entryName);
    const version = versions.get(entryName);
    const palette = palettes.get(entryName);

    return [version, palette, texture];
};

export const checkAsset = (version, entryName, palette) => {
    const savedTexture = textures.get(entryName);
    const savedVersion = versions.get(entryName);
    const savedPalette = palettes.get(entryName);

    const savedMinSize = Math.max(...savedTexture);

    const issues = [];

    console.debug('Check version: %s >= %s', savedVersion, version);
    console.debug('Check palette: %s < %s', savedMinSize, palette.colors.size);

    if (lt(savedVersion, version)) {
        issues.push(
            'This texture was sampled using an older Minecraft version.'
        );
    }

    if (savedMinSize >= palette.colors.size) {
        issues.push(
            'The saved version of this texture uses more colors than the palette provides.'
        );
    }

    if (!savedPalette) {
        issues.push(
            'Issues cannot be recovered automatically as this texture was saved in an older version of lo-rez-editor.'
        );
    } else if (savedPalette.join(':') !== palette.toArray().join(':')) {
        issues.push(
            'The color palette has changed since this texture was saved.'
        );
    }

    return issues;
};
