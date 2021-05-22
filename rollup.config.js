const analyze = require('rollup-plugin-analyzer');
const cleanup = require('rollup-plugin-cleanup');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve').default;
const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const input = 'src/index.js';
const inputESM = 'src/index.esm.js';

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) 2017-${new Date().getFullYear()} Akihiko Kusanagi
 * Released under the ${pkg.license} license
 */`;

module.exports = [
  {
    input,
    plugins: [
      json(),
      resolve(),
      cleanup({
        sourcemap: true
      }),
      analyze({summaryOnly: true})
    ],
    output: {
      name: 'ChartStreaming',
      file: `dist/${pkg.name}.js`,
      banner,
      format: 'umd',
      indent: false,
      globals: {
        'chart.js': 'Chart',
        'chart.js/helpers': 'Chart.helpers'
      }
    },
    external: [
      'chart.js',
      'chart.js/helpers'
    ]
  },
  {
    input,
    plugins: [
      json(),
      resolve(),
      terser({
        output: {
          preamble: banner
        }
      })
    ],
    output: {
      name: 'ChartStreaming',
      file: `dist/${pkg.name}.min.js`,
      format: 'umd',
      indent: false,
      globals: {
        'chart.js': 'Chart',
        'chart.js/helpers': 'Chart.helpers'
      }
    },
    external: [
      'chart.js',
      'chart.js/helpers'
    ]
  },
  {
    input: inputESM,
    plugins: [
      json(),
      resolve(),
      cleanup({
        sourcemap: true
      }),
    ],
    output: {
      file: pkg.module,
      banner,
      format: 'esm',
      indent: false,
    },
    external: [
      'chart.js',
      'chart.js/helpers'
    ]
  }
];
