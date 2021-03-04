const convert = (data) =>
    `#${Array.from(data)
        .map((d) => d.toString(16).padStart(2, '0'))
        .join('')}`;

export function extract(src, callback) {
    const source = document.createElement('img');
    const palette = new Set();

    source.addEventListener('load', function () {
        const width = this.naturalWidth;
        const height = this.naturalHeight;

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        context.drawImage(this, 0, 0);

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < height; x += 1) {
                const pixel = context.getImageData(x, y, 1, 1);

                palette.add(convert(pixel.data));
            }
        }

        callback({
            width,
            height,
            palette,
        });
    });

    source.src = src;
}
