import { Palette } from '../struct/palette';

const toColor = (data) =>
    `#${Array.from(data)
        .map((d) => d.toString(16).padStart(2, '0'))
        .join('')}`.toLowerCase();

export const extract = (src, callback) => {
    const source = document.createElement('img');
    const palette = new Palette();

    source.addEventListener('load', function () {
        const width = this.naturalWidth;
        const height = this.naturalHeight;

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        const getAt = (x, y) => toColor(context.getImageData(x, y, 1, 1).data);

        context.drawImage(this, 0, 0);

        /* Okay, so: It seems that `getAt` on some images returns a different
         * color the first time, and that creates ghost colors in the palette.
         * Calling `getImageData` once fixes it.
         */
        context.getImageData(0, 0, 1, 1);

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                palette.addColor(getAt(x, y));
            }
        }

        callback({
            width,
            height,
            getAt,
            palette: palette.cleanup(),
        });
    });

    source.src = src;
};

export const paint = (texture, palette) => {
    const height = texture?.length || 0;
    const width = texture[0]?.length || 0;
    const colors = [...(palette?.colors || [])];

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < height; x += 1) {
            context.fillStyle = colors[texture[y][x]];
            context.fillRect(x, y, 1, 1);
        }
    }

    return canvas.toDataURL('image/png', 1.0);
};
