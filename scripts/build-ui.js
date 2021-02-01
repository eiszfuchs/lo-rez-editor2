// Shamelessly inspired by
// github.com/IBM/carbon-components-svelte/blob/master/scripts/build-css.js

console.warn('This might take a hot minute');

const { writeFileSync, mkdirSync } = require('fs');
const { renderSync } = require('sass');

const { css } = renderSync({
    file: 'src/ui-theme.scss',
    omitSourceMapUrl: true,
    includePaths: ['node_modules'],
});

mkdirSync('static/build', { recursive: true });
writeFileSync('static/build/ui-theme.css', css);
