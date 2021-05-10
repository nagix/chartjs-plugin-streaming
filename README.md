# chartjs-plugin-streaming

[![npm](https://img.shields.io/npm/v/chartjs-plugin-streaming.svg?style=flat-square)](https://npmjs.com/package/chartjs-plugin-streaming) [![Bower](https://img.shields.io/bower/v/chartjs-plugin-streaming.svg?style=flat-square)](https://libraries.io/bower/chartjs-plugin-streaming) [![Travis](https://img.shields.io/travis/nagix/chartjs-plugin-streaming/master.svg?style=flat-square)](https://travis-ci.org/nagix/chartjs-plugin-streaming) [![Code Climate](https://img.shields.io/codeclimate/maintainability/nagix/chartjs-plugin-streaming.svg?style=flat-square)](https://codeclimate.com/github/nagix/chartjs-plugin-streaming) [![Awesome](https://awesome.re/badge-flat2.svg)](https://github.com/chartjs/awesome)

*[Chart.js](https://www.chartjs.org) plugin for live streaming data*

Version 1.9 requires Chart.js 2.7.x, 2.8.x or 2.9.x. If you need Chart.js 2.6.x support, use [version 1.2.0](https://github.com/nagix/chartjs-plugin-streaming/releases/tag/v1.2.0).

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

To use CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@latest/dist/chartjs-plugin-streaming.min.js"></script>
```
```html
<script src="https://unpkg.com/chartjs-plugin-streaming@latest/dist/chartjs-plugin-streaming.min.js"></script>
```

## Usage

chartjs-plugin-streaming can be used with ES6 modules, plain JavaScript and module loaders.

chartjs-plugin-streaming requires [Moment.js](https://momentjs.com/) and [Chart.js](https://www.chartjs.org). If you are using Chart.js 2.8.0 or later, [other date libraries and corresponding adapters](https://github.com/chartjs/awesome#adapters) can be used. Note that Moment.js is still required, though.

Version 1.9 supports the [line](https://www.chartjs.org/docs/latest/charts/line.html) and [bar](https://www.chartjs.org/docs/latest/charts/bar.html) chart types with both [Number data](https://www.chartjs.org/docs/latest/charts/line.html#number) and [Point data](https://www.chartjs.org/docs/latest/charts/line.html#point) (each data point is specified an array of objects containing x and y properties) as well as the [bubble](https://www.chartjs.org/docs/latest/charts/bubble.html) and [scatter](https://www.chartjs.org/docs/latest/charts/scatter.html) chart types with Point data. In case of Point data, either x or y must be in any of the date formats that the data library accepts ([date formats](https://momentjs.com/docs/#/parsing/) in case of Moment.js), and the corresponding axis must have a 'realtime' scale that has the same options as [time](https://www.chartjs.org/docs/latest/axes/cartesian/time.html) scale. Once the realtime scale is specified, the chart will auto-scroll along with that axis. Old data will be automatically deleted after the time specified by the `ttl` option, or as it disappears off the chart.

### Usage in ES6 as module

Nothing else than importing the module should be enough.

```js
import 'chartjs-plugin-streaming';
```

## Tutorial and Samples

You can find a tutorial and samples at [nagix.github.io/chartjs-plugin-streaming](https://nagix.github.io/chartjs-plugin-streaming).

## Configuration

The plugin options can be changed at 3 different levels and with the following priority:

- per axis: `options.scales.xAxes[].realtime.*` or `options.scales.yAxes[].realtime.*`
- per chart: `options.plugins.streaming.*`
- globally: `Chart.defaults.global.plugins.streaming.*`

All available options are listed below. [This example](https://nagix.github.io/chartjs-plugin-streaming/samples/interactions.html) shows how each option affects the appearance of a chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `duration` | `number` | `10000` | Duration of the chart in milliseconds (how much time of data it will show).
| `ttl` | `number` | | Duration of the data to be kept in milliseconds. If not set, old data will be automatically deleted as it disappears off the chart.
| `delay` | `number` | `0` | Delay added to the chart in milliseconds so that upcoming values are known before lines are plotted. This makes the chart look like a continual stream rather than very jumpy on the right hand side. Specify the maximum expected delay.
| `refresh` | `number` | `1000` | Refresh interval of data in milliseconds. `onRefresh` callback function will be called at this interval.
| `onRefresh` | `function` | `null` | Callback function that will be called at a regular interval. The callback takes one argument, a reference to the chart object. You can update your datasets here. The chart will be automatically updated after returning.
| `frameRate` | `number` | `30` | Frequency at which the chart is drawn on a display (frames per second). This option can be set at chart level but not at axis level. Decrease this value to save CPU power. [more...](#lowering-cpu-usage)
| `pause` | `boolean` | `false` | If set to `true`, scrolling stops. Note that `onRefresh` callback is called even when this is set to `true`.

Due to historical reasons, a chart with the 'time' scale will also auto-scroll if this plugin is enabled. If you want to stop scrolling a particular chart, set `options.plugins.streaming` to `false`.

Note that the following axis options are ignored for the 'realtime' scale.

- `bounds`
- `distribution` (always `'linear'`)
- `offset` (always `false`)
- `ticks.major.enabled` (always `true`)
- `time.max`
- `time.min`

## Data Feed Models

This plugin supports both pull and push based data feed.

### Pull Model (Polling Based) - Synchronous

In the pull model, the user code needs to ask for new data and pull it from a data source. To enable this, the plugin provides two options: `onRefresh` which is the callback function that is called at a regular interval to check the data source and `refresh` which specifies the interval. In this callback function, you can add data into the existing data array as usual, but you don't need to call the `update` function as it is called internally.

For example:

```javascript
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
                type: 'realtime',   // x axis will auto-scroll from right to left
                realtime: {         // per-axis options
                    duration: 20000,    // data in the past 20000 ms will be displayed
                    refresh: 1000,      // onRefresh callback will be called every 1000 ms
                    delay: 1000,        // delay of 1000 ms, so upcoming values are known before plotting a line
                    pause: false,       // chart is not paused
                    ttl: undefined,     // data will be automatically deleted as it disappears off the chart

                    // a callback to update datasets
                    onRefresh: function(chart) {

                        // query your data source and get the array of {x: timestamp, y: value} objects
                        var data = getLatestData();

                        // append the new data array to the existing chart data
                        Array.prototype.push.apply(chart.data.datasets[0].data, data);
                    }
                }
            }]
        },
        plugins: {
            streaming: {            // per-chart option
                frameRate: 30       // chart is drawn 30 times every second
            }
        }
    }
}
```

### Pull Model (Polling Based) - Asynchronous

If your data source responds to requests asynchronously, you will probably receive the results in a callback function in which you can add data into the existing data array. The `update` function needs to be called after adding new data.

A problem with calling the `update` function for stream data feeds is that it can disrupt smooth transition because an `update` call interrupts the current animation and initiates a new one. To avoid this, this plugin added the `preservation` config property for the `update` function. If it is set to `true`, the current animation won't be interrupted and new data can be added without initiating a new animation.

This model is suitable for data sources such as web servers, Kafka (REST Proxy), Kinesis (Data Streams API) and other time series databases with REST API support including Elasticsearch, OpenTSDB and Graphite.

For example:

```javascript
{
    options: {
        scales: {
            xAxes: [{
                realtime: {
                    onRefresh: function(chart) {
                        // request data so that it can be received in a callback function
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', YOUR_DATA_SOURCE_URL);
                        xhr.onload = function () {
                            if (xhr.readyState === 4 && xhr.status === 200) {

                                // assume the response is an array of {x: timestamp, y: value} objects
                                var data = JSON.parse(xhr.responseText);

                                // append the new data array to the existing chart data
                                Array.prototype.push.apply(chart.data.datasets[0].data, data);

                                // update chart datasets keeping the current animation
                                chart.update({
                                    preservation: true
                                });
                            }
                        };
                        xhr.send();
                    }
                }
            }]
        }
    }
}
```

### Push Model (Listening Based)

In the push model, the user code registers a listener that waits for new data, and data can be picked up immediately after it arrives. Usually, data source connector libraries that support the push model provide a listener callback function in which you can add data into the existing data array. `onRefresh` is unnecessary in this model, but the `update` function needs to be called after adding new data like asynchronous pull model.

This model is suitable for data sources such as WebSocket, MQTT, Kinesis (Client Library) and other realtime messaging services including Socket.IO, Pusher and Firebase.

Here is an example of a listener function:

```javascript
// save the chart instance to a variable
var myChart = new Chart(ctx, config);

// your event listener code - assuming the event object has the timestamp and value properties
function onReceive(event) {

    // append the new data to the existing chart data
    myChart.data.datasets[0].data.push({
        x: event.timestamp,
        y: event.value
    });

    // update chart datasets keeping the current animation
    myChart.update({
        preservation: true
    });
}
```

## Support for Zooming and panning

By using together with [chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom), zooming and panning of a streaming chart can be done via the mouse or finger gestures. Unlike other scale types, the `rangeMin` and `rangeMax` options don't specify time values. Instead, `pan.rangeMin` and `pan.rangeMax` limit the range of the `delay` option value while `zoom.rangeMin` and `zoom.rangeMax` limit the range of the `duration` option value.

```javascript
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

Note that `chartjs-plugin-zoom.js` needs to be included before `chartjs-plugin-streaming.js`.

## Lowering CPU Usage

If you are using this plugin on resource constrained devices or drawing multiple charts on a large screen, it might be a good idea to decrease the frame rate to lower CPU usage. The following settings also reduce CPU usage by disabling animation, and improve general page performance.

```javascript
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
gulp build            # build dist files
gulp build --watch    # build and watch for changes
gulp lint             # perform code linting
gulp package          # create an archive with dist files and samples
```

## License

chartjs-plugin-streaming is available under the [MIT license](https://opensource.org/licenses/MIT).
