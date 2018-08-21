# chartjs-plugin-streaming

[![npm](https://img.shields.io/npm/v/chartjs-plugin-streaming.svg?style=flat-square)](https://npmjs.com/package/chartjs-plugin-streaming) [![Bower](https://img.shields.io/bower/v/chartjs-plugin-streaming.svg?style=flat-square)](https://libraries.io/bower/chartjs-plugin-streaming) [![Travis](https://img.shields.io/travis/nagix/chartjs-plugin-streaming/master.svg?style=flat-square)](https://travis-ci.org/nagix/chartjs-plugin-streaming) [![Code Climate](https://img.shields.io/codeclimate/maintainability/nagix/chartjs-plugin-streaming.svg?style=flat-square)](https://codeclimate.com/github/nagix/chartjs-plugin-streaming)

*[Chart.js](https://www.chartjs.org) plugin for live streaming data*

Version 1.2 or earlier requires Chart.js 2.6.x. Version 1.3 or later requires Chart.js 2.7.x.

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

chartjs-plugin-streaming requires [Moment.js](https://momentjs.com/) and [Chart.js](https://www.chartjs.org).

Version 1.6 supports the [line](https://www.chartjs.org/docs/latest/charts/line.html) and [bar](https://www.chartjs.org/docs/latest/charts/bar.html) chart types with both [Number data](https://www.chartjs.org/docs/latest/charts/line.html#number) and [Point data](https://www.chartjs.org/docs/latest/charts/line.html#point) (each data point is specified an array of objects containing x and y properties) as well as the [bubble](https://www.chartjs.org/docs/latest/charts/bubble.html) and [scatter](https://www.chartjs.org/docs/latest/charts/scatter.html) chart types with Point data. In case of Point data, either x or y must be in any of the [date formats](https://momentjs.com/docs/#/parsing/) that Moment.js accepts, and the corresponding axis must have a 'realtime' scale that has the same options as [time](https://www.chartjs.org/docs/latest/axes/cartesian/time.html) scale. Once the realtime scale is specified, the chart will auto-scroll along with that axis. Old data will be automatically deleted after the time specified by the `ttl` option, or as it disappears off the chart.

## Tutorial and Samples

You can find a tutorial and samples at [nagix.github.io/chartjs-plugin-streaming](https://nagix.github.io/chartjs-plugin-streaming).

## Configuration

To configure this plugin, you can simply add the following entries to your chart options. [This example](https://nagix.github.io/chartjs-plugin-streaming/samples/interactions.html) shows how each option affects the appearance of a chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `plugins.streaming` | `Object` or `Boolean` | `true` | The streaming options (see `plugins.streaming.*` options). Also accepts a boolean, in which case if `true`, the chart will auto-scroll using the **global options**, else if `false`, the chart will not auto-scroll.
| `plugins.streaming.duration` | `Number` | `10000` | Duration of the chart in milliseconds (how much time of data it will show).
| `plugins.streaming.refresh` | `Number` | `1000` | Refresh interval of data in milliseconds. `onRefresh` callback function will be called at this interval.
| `plugins.streaming.delay` | `Number` | `0` | Delay added to the chart in milliseconds so that upcoming values are known before lines are plotted. This makes the chart look like a continual stream rather than very jumpy on the right hand side. Specify the maximum expected delay.
| `plugins.streaming.frameRate` | `Number` | `30` | Frequency at which the chart is drawn on a display (frames per second). Decrease this value to save CPU power. [more...](#lowering-cpu-usage)
| `plugins.streaming.pause` | `Boolean` | `false` | If set to `true`, scrolling stops. Note that `onRefresh` callback is called even when this is set to `true`.
| `plugins.streaming.onRefresh` | `Function` | `null` | Callback function that will be called at a regular interval. The callback takes one argument, a reference to the chart object. You can update your datasets here. The chart will be automatically updated after returning.
| `plugins.streaming.ttl` | `Number` | | Duration of the data to be kept in milliseconds. If not set, old data will be automatically deleted as it disappears off the chart.

> **Global options** can be change through `Chart.defaults.global.plugins.streaming`, which by default enable auto-scroll of the charts that have a time scale.

For example:

```
{
    type: 'line',               // 'line', 'bar', 'bubble' and 'scatter' types are supported
    data: {
        datasets: [{
            data: []            // empty at the beginning
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'realtime'    // x axis will auto-scroll from right to left
            }]
        },
        plugins: {
            streaming: {            // enabled by default
                duration: 20000,    // data in the past 20000 ms will be displayed
                refresh: 1000,      // onRefresh callback will be called every 1000 ms
                delay: 1000,        // delay of 1000 ms, so upcoming values are known before plotting a line
                frameRate: 30,      // chart is drawn 30 times every second
                pause: false,       // chart is not paused
                ttl: undefined,     // data will be automatically deleted as it disappears off the chart

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
}
```

Note that the following options are ignored for the 'realtime' scale.

- `bounds`
- `distribution` (always `'linear'`)
- `offset` (always `false`)
- `ticks.major.enabled` (always `true`)
- `time.max`
- `time.min`

## Support for Zooming and panning

By using together with [chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom), zooming and panning of a streaming chart can be done via the mouse or finger gestures. Unlike other scale types, the `rangeMin` and `rangeMax` options don't specify time values. Instead, `pan.rangeMin` and `pan.rangeMax` limit the range of the `delay` option value while `zoom.rangeMin` and `zoom.rangeMax` limit the range of the `duration` option value.

```
    options: {
        // Assume x axis is the realtime scale
        pan: {
            enabled: true,    // Enable panning
            mode: 'x',        // Allow panning in the x direction
            rangeMin: {
                x: null       // Min value of the delay option
            },
            rangeMax: {
                x: null       // Max value of the delay option
            }
        },
        zoom: {
            enabled: true,    // Enable zooming
            mode: 'x',        // Allow zooming in the x direction
            rangeMin: {
                x: null       // Min value of the duration option
            },
            rangeMax: {
                x: null       // Max value of the duration option
            }
        }
    }
```

## Lowering CPU Usage

If you are using this plugin on resource constrained devices or drawing multiple charts on a large screen, it might be a good idea to decrease the frame rate to lower CPU usage. The following settings also reduce CPU usage by disabling animation, and improve general page performance.

```
    options: {
        animation: {
            duration: 0                    // general animation time
        },
        hover: {
            animationDuration: 0           // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0,    // animation duration after a resize
        plugins: {
            streaming: {
                frameRate: 5               // chart is drawn 5 times every second
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
gulp build      # build dist files
gulp watch      # watch for changes and build automatically
gulp lint       # perform code linting
gulp package    # create an archive with dist files and samples
```

## License

chartjs-plugin-streaming is available under the [MIT license](https://opensource.org/licenses/MIT).
