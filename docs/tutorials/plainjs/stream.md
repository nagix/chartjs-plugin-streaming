# Stream data

You can append the data in the `onRefresh` callback function that is called at a regular interval. Each data has two properties - the timestamp of the data point, and the value of the data point.

Note that old data will be automatically deleted as it disappears off the chart.

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
