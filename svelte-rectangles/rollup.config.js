import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import html from '@rollup/plugin-html';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: {
		'ui': 'src/ui.ts',
		'code': 'src/code.ts',
	},
	output: {
		sourcemap: false,
		dir: 'dist',
		entryFileNames: '[name].js'
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({ sourceMap: false }),
			compilerOptions: {
				dev: !production
			}
		}),
		css({ output: 'styles.css' }),
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: false,
			inlineSources: false,
		}),
		production && terser(),
		html({
			fileName: 'ui.html',
			template({ bundle }) {
				return `
					<style>${bundle['styles.css'] && bundle['styles.css'].source}</style>
					<div id="svelte-app"></div>
					<script>${bundle['ui.js'].code}</script>
				`;
			}
		})
	],
	watch: {
		clearScreen: false
	}
};
