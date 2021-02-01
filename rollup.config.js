import svelte from 'rollup-plugin-svelte';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import preprocess from 'svelte-preprocess';
import css from 'rollup-plugin-css-only';
import { optimizeCarbonImports } from 'carbon-components-svelte/preprocess';

export default {
    input: 'src/index.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: 'static/build/bundle.js',
    },
    external: ['fs', 'child_process', 'process'],
    plugins: [
        svelte({
            preprocess: [
                // Reduces build times from 12 seconds to 2
                optimizeCarbonImports(),
                preprocess(),
            ],
            compilerOptions: {
                dev: true,
            },
        }),

        alias({
            entries: [{ find: '@', replacement: 'src/' }],
        }),

        css({
            output: 'bundle.css',
        }),

        resolve({
            browser: false,
            preferBuiltins: false,
            dedupe: ['svelte'],
        }),

        commonjs(),
    ],
};
