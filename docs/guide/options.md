# Options

The following table lists all available options:

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `duration` | `number` | `10000` | Duration of the chart in milliseconds (how much time of data it will show).
| `ttl` | `number` | | Duration of the data to be kept in milliseconds. If not set, old data will be automatically deleted as it disappears off the chart.
| `delay` | `number` | `0` | Delay added to the chart in milliseconds so that upcoming values are known before lines are plotted. This makes the chart look like a continual stream rather than very jumpy on the right hand side. Specify the maximum expected delay.
| `refresh` | `number` | `1000` | Refresh interval of data in milliseconds. `onRefresh` callback function will be called at this interval.
| [`onRefresh`](#onrefresh) | `function` | `null` | Callback function that will be called at a regular interval. [more...](#onrefresh)
| `frameRate` | `number` | `30` | Frequency at which the chart is drawn on a display (frames per second). Decrease this value to save CPU power. [more...](performance.md#lowering-cpu-usage)
| `pause` | `boolean` | `false` | If set to `true`, scrolling stops. Note that `onRefresh` callback is called even when this is set to `true`.

::: tip
Refer to the [Configuration](getting-started.md#configuration) section if you don't know how to configure these options.
:::

Note that the following axis options are ignored for the `'realtime'` scale.

- `bounds`
- `max`
- `min`
- `offset` (always `false`)
- `ticks.autoSkip` (always `false`)
- `ticks.major.enabled` (always `true`)

## onRefresh

The `onRefresh` callback function takes one argument, a reference to the chart object. The `this` keyword for the callback function is set to the scale object.

You can update your datasets here. The chart will be automatically updated after returning, so you don't need to call `chart.update()`. The following example shows how to append data at every refresh interval.

```js
const myChart = new Chart(ctx, {
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          onRefresh: function(chart) {
            chart.data.datasets.forEach(function(dataset) {
              dataset.data.push({
                x: Date.now(),
                y: Math.random()
              });
            });
          }
        }
      }
    }
  }
});
```
