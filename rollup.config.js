const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} Akihiko Kusanagi
 * Released under the ${pkg.license} license
 */`;

module.exports = [
  {
    input: 'src/index.js',
    output: {
      name: 'ChartStreaming',
      file: `dist/${pkg.name}.js`,
      banner: banner,
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
    input: 'src/index.js',
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
    plugins: [
      terser({
        output: {
          preamble: banner
        }
      })
    ],
    external: [
      'chart.js',
      'chart.js/helpers'
    ]
  }
];
