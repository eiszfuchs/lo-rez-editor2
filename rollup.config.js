import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';

export default {
	input: 'src/index.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'static/build/bundle.js',
		globals: {
			fs: 'fs',
		},
	},
	plugins: [
		svelte({
			compilerOptions: {
				dev: true
			}
		}),
		css({ output: 'bundle.css' }),

		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
	],
};
