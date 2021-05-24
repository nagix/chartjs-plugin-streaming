# Add some delay

The previous chart shows an issue. We cannot plot a line until the next data point is known. To get around this, we add a delay to the chart, so upcoming values are known before we need to plot the line.

This makes the chart look like a continual stream rather than very jumpy on the right hand side.

```js chart-editor
// <block:config>
const config = {
  type: 'line',
  data: {
    datasets: [
      {
        data: []
      },
      {
        data: []
      }
    ]
  },
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          delay: 2000,
          onRefresh: chart => {
            chart.data.datasets.forEach(dataset => {
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
};
// </block:config>

config.options.plugins = {
  annotation: false,
  datalabels: false,
  zoom: false
};

module.exports = {
  config: config
};
```
