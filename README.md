# chartjs-plugin-streaming

[![npm](https://img.shields.io/npm/v/chartjs-plugin-streaming.svg?style=flat-square)](https://npmjs.com/package/chartjs-plugin-streaming) [![Bower](https://img.shields.io/bower/v/chartjs-plugin-streaming.svg?style=flat-square)](https://libraries.io/bower/chartjs-plugin-streaming) [![Travis](https://img.shields.io/travis/chartjs/chartjs-plugin-streaming.svg?style=flat-square)](https://travis-ci.org/chartjs/chartjs-plugin-streaming) [![Code Climate](https://img.shields.io/codeclimate/github/chartjs/chartjs-plugin-streaming.svg?style=flat-square)](https://codeclimate.com/github/chartjs/chartjs-plugin-streaming)

*[Chart.js](http://www.chartjs.org) plugin for live streaming data*

Requires Chart.js 2.6.0 or later.

## Installation

You can download the latest version of chartjs-plugin-streaming from the [GitHub releases](https://github.com/nagix/chartjs-plugin-streaming/releases/latest).

To install via npm:

```bash
npm install chartjs-plugin-streaming --save
```

To install via bower:

```bash
bower install chartjs-plugin-streaming --save
```

## Usage

chartjs-plugin-streaming can be used with ES6 modules, plain JavaScript and module loaders.

chartjs-plugin-streaming requires [Moment.js](http://momentjs.com/) and [Chart.js](http://www.chartjs.org).

Currently, only the [line](http://www.chartjs.org/docs/latest/charts/line.html) chart type with [point data](http://www.chartjs.org/docs/latest/charts/line.html#point) (each data point is specified an array of an object containing x and y properties) is supported. Either x or y must be in any of the [date formats](http://momentjs.com/docs/#/parsing/) that Moment.js accepts, and the corresponding axis must have a [time](http://www.chartjs.org/docs/latest/axes/cartesian/time.html) scale. Once the time scale is specified, the chart will auto-scroll along with that axis.

## Tutorial

You can find a tutorial and samples at [nagix.github.io/chartjs-plugin-streaming](https://nagix.github.io/chartjs-plugin-streaming).

## Configuration

To configure this plugin, you can simply add the following entries to your chart options:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `plugins.streaming` | `object`/`boolean` | `true` | The streaming options (see `plugins.streaming.*` options). Also accepts a boolean, in which case if `true`, the chart will auto-scroll using the **global options**, else if `false`, the chart will not auto-scroll.
| `plugins.streaming.duration` | `number` | `10000` | Duration of the chart in milliseconds (how much time of data it will show).
| `plugins.streaming.refresh` | `number` | `1000` | Reshresh interval of data in milliseconds. `onRefresh` callback function will be called at this interval.
| `plugins.streaming.delay` | `number` | `0` | Delay added to the chart in milliseconds so that upcoming values are known before lines are plotted. This makes the chart look like a continual stream rather than very jumpy on the right hand side. Specify the maximum expected delay.
| `plugins.streaming.onRefresh` | `function` | `undefined` | Callback function that will be called at a regular interval. The callback takes one argument, a reference to the chart object. You can update your datasets here. The chart will be automatically updated after returning.

> **Global options** can be change through `Chart.defaults.global.plugins.streaming`, which by default defer the chart loading until the first line of pixels of the canvas appears in the viewport.

For example:

```
{
    plugins: {
        streaming: {            // enabled by default
            duration: 20000,    // data in the past 20000 ms will be displayed
            refresh: 1000,      // onRefresh callback will be called every 1000 ms
            delay: 1000,        // delay of 1000 ms, so upcoming values are known before plotting a line

            // a callback to update datasets
            onRefresh: function(chart) {
                chart.data.datasets[0].data.push({
                    x: Date.now(),
                    y: Math.random() * 100
                });
            }
        }
    }
}
```

## Building

You first need to install node dependencies (requires [Node.js](https://nodejs.org/)):

```bash
npm install
```

The following commands will then be available from the repository root:

```bash
gulp build            # build dist files
gulp build --watch    # build and watch for changes
gulp lint             # perform code linting
gulp package          # create an archive with dist files and samples
```

## License

chartjs-plugin-streaming is available under the [MIT license](http://opensource.org/licenses/MIT).
