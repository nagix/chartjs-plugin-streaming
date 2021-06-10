# Integration

`chartjs-plugin-streaming` can work with other Chart.js plugins.

## Annotation Plugin

By using together with [chartjs-plugin-annotation](https://github.com/chartjs/chartjs-plugin-annotation), you can get annotations to scroll along with the realtime scale axis.

::: warning COMPATIBILITY NOTE
This plugin requires chartjs-plugin-annotation **1.x**.
:::

```js
const myChart = new Chart(ctx, {
  options: {
    plugins: {
      annotation: {
        annotations: {
          // Assume x axis has the realtime scale
          line: {
            drawTime: 'afterDatasetsDraw',
            type: 'line',
            scaleID: 'x',
            value: LINE_TIME
          },
          box: {
            drawTime: 'beforeDatasetsDraw',
            type: 'box',
            xMin: BOX_START_TIME,
            xMax: BOX_END_TIME
          }
        }
      }
    }
  }
});
```

Note that `chartjs-plugin-annotation.js` needs to be included before `chartjs-plugin-streaming.js`.

## Data Labels Plugin

By using together with [chartjs-plugin-datalabels](https://github.com/chartjs/chartjs-plugin-datalabels), labels on data can be displayed in the streaming chart.

::: warning COMPATIBILITY NOTE
This plugin requires chartjs-plugin-datalabels **2.x**.
:::

```js
const myChart = new Chart(ctx, {
  options: {
    plugins: {
      datalabels: {
        // Assume x axis has the realtime scale
        backgroundColor: context => context.dataset.borderColor,
        padding: 4,
        borderRadius: 4,
        clip: true,       // true is recommended to keep labels running off the chart area
        color: 'white',
        font: {
          weight: 'bold'
        },
        formatter: value => value.y
      }
    }
  }
});
```

Note that `chartjs-plugin-datalabels.js` needs to be included before `chartjs-plugin-streaming.js`.

## Financial Chart

By using together with [chartjs-chart-financial](https://github.com/chartjs/chartjs-chart-financial), auto-scrollable financial charts can be created.

::: warning COMPATIBILITY NOTE
chartjs-chart-financial is still pre-release. We confirmed that it works with the [commit #5dcdca5](https://github.com/chartjs/chartjs-chart-financial/blob/5dcdca5001671a7cfd840a055a16ce113c8ab05a/docs/chartjs-chart-financial.js).
:::

```js
const myChart = new Chart(ctx, {
  type: 'candlestick',    // or 'ohlc'
  options: {
    scales: {
      x: {
        type: 'realtime',
        ticks: {
          source: 'auto'  // default for candlestick chart is 'data'
        }
      }
    }
  }
});
```

Note that `chartjs-chart-financial.js` needs to be included before `chartjs-plugin-streaming.js`.

## Zoom Plugin

By using together with [chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom), zooming and panning of a streaming chart can be done via the mouse or finger gestures.

::: warning COMPATIBILITY NOTE
This plugin requires chartjs-plugin-zoom **1.x**.
:::

Unlike other scale types, the `min`, `max` and `minRange` in the `limits` options are not used. Instead, the `minDelay`, `maxDelay`, `minDuration` and `maxDuration` limit the range of the `delay` and `duration` option values.

```js
const myChart = new Chart(ctx, {
  options: {
    plugins: {
      zoom: {
        // Assume x axis has the realtime scale
        pan: {
          enabled: true,        // Enable panning
          mode: 'x'             // Allow panning in the x direction
        },
        zoom: {
          pinch: {
            enabled: true       // Enable pinch zooming
          },
          wheel: {
            enabled: true       // Enable wheel zooming
          },
          mode: 'x'             // Allow zooming in the x direction
        },
        limits: {
          x: {
            minDelay: null,     // Min value of the delay option
            maxDelay: null,     // Max value of the delay option
            minDuration: null,  // Min value of the duration option
            maxDuration: null   // Max value of the duration option
          }
        }
      }
    }
  }
});
```

Note that `chartjs-plugin-zoom.js` needs to be included before `chartjs-plugin-streaming.js`.
