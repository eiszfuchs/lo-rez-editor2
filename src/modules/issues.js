import { drafts, palettes, textures, versions } from '@/stores/project.js';
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

    const draft = drafts.get(entryName, false);
    const version = versions.get(entryName);
    const palette = palettes.get(entryName);
    const texture = textures.get(entryName);

    return [draft, version, palette, texture];
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
        issues.push('old_samples');
    }

    if (savedMinSize >= palette.colors.size) {
        issues.push('too_many_colors');
    }

    if (!savedPalette) {
        issues.push('no_palette');
    } else if (savedPalette.join(':') !== palette.toArray().join(':')) {
        issues.push('palette_changed');
    }

    return issues;
};
