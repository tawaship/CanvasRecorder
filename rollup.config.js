const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const buble = require('@rollup/plugin-buble');
const { terser } = require('rollup-plugin-terser');

const conf = require('./package.json');
const version = conf.version;

const banner = [
	'/*!',
	` * @tawaship/canvas-recorder - v${version}`,
	' * ',
	' * @author tawaship (makazu.mori@gmail.com)',
	' * @license MIT',
	' */',
	''
].join('\n');

module.exports = [
	{
		input: 'src/module.ts',
		output: [
			{
				banner,
				file: 'dist/CanvasRecorder.cjs.js',
				format: 'cjs',
				sourcemap: true
			},
			{
				banner,
				file: 'dist/CanvasRecorder.esm.js',
				format: 'esm',
				sourcemap: true
			}
		],
		watch: false,
		plugins: [
			nodeResolve(),
			commonjs(),
			typescript()
		]
	},
	{
		input: 'src/browser.ts',
		watch: {
			clearScreen: false
		},
		output: [
			{
				banner: banner,
				file: 'dist/CanvasRecorder.js',
				format: 'iife',
				name: 'CanvasRecorder',
				sourcemap: true
			}
		],
		plugins: [
			nodeResolve(),
			commonjs(),
			typescript({tsconfig: 'tsconfig.json'}),
			buble(),
			terser({
				compress: {
					//drop_console: true
					//pure_funcs: ['console.log']
				},
				mangle: false,
				output: {
					beautify: true,
					braces: true
				}
			})
		]
	},
	{
		input: 'src/browser.ts',
		watch: false,
		output: [
			{
				banner: banner,
				file: 'dist/CanvasRecorder.min.js',
				format: 'iife',
				sourcemap: true,
				name: 'CanvasRecorder',
				compact: true
			}
		],
		plugins: [
			nodeResolve(),
			commonjs(),
			typescript({tsconfig: 'tsconfig.json'}),
			buble(),
			terser({
				compress: {
					//drop_console: true,
					pure_funcs: ['console.log']
				}
			})
		]
	}
];