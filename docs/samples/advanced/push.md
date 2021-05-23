# Push Data Feed

```js chart-editor
// <block:setup:1>
const data = {
  datasets: [
    {
      label: 'Dataset 1 (Linear Interpolation)',
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      borderColor: Utils.CHART_COLORS.red,
      borderDash: [8, 4],
      data: []
    },
    {
      label: 'Dataset 2 (Cubic Interpolation)',
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
      borderColor: Utils.CHART_COLORS.blue,
      cubicInterpolationMode: 'monotone',
      data: []
    }
  ]
};

const onReceive = function(event) {
  this.data.datasets[event.index].data.push({
    x: event.timestamp,
    y: event.value
  });
  this.update('quiet');
};

const timeoutIDs = [];

const startFeed = (chart, index) => {
  var receive = () => {
    onReceive.call(chart, {
      index: index,
      timestamp: Date.now(),
      value: Utils.rand(-100, 100)
    });
    timeoutIDs[index] = setTimeout(receive, Utils.rand(500, 1500));
  };
  timeoutIDs[index] = setTimeout(receive, Utils.rand(500, 1500));
};

const stopFeed = index => {
  if (index === undefined) {
    for (const id of timeoutIDs) {
      clearTimeout(id);
    }
  } else {
    clearTimeout(timeoutIDs[index]);
  }
};

const start = chart => {
  startFeed(chart, 0);
  startFeed(chart, 1);
};

const stop = () => {
  stopFeed();
};
// </block:setup>

// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data.forEach(dataObj => {
          dataObj.y = Utils.rand(-100, 100);
        });
      });
      chart.update();
    }
  },
  {
    name: 'Add Dataset',
    handler(chart) {
      const datasets = chart.data.datasets;
      const dsColor = Utils.namedColor(datasets.length);
      const newDataset = {
        label: 'Dataset ' + (datasets.length + 1),
        backgroundColor: Utils.transparentize(dsColor, 0.5),
        borderColor: dsColor,
        data: []
      };
      datasets.push(newDataset);
      chart.update();
      startFeed(chart, datasets.length - 1);
    }
  },
  {
    name: 'Add Data',
    handler(chart) {
      onRefresh(chart);
      chart.update();
    }
  },
  {
    name: 'Remove Dataset',
    handler(chart) {
      stopFeed(chart.data.datasets.length - 1);
      chart.data.datasets.pop();
      chart.update();
    }
  },
  {
    name: 'Remove Data',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data.shift();
      });
      chart.update();
    }
  }
];
// </block:actions>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  plugins: [
    {
      start: start,
      stop: stop
    }
  ],
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 20000,
          delay: 2000
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        }
      }
    },
    interaction: {
      intersect: false
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
  actions: actions,
  config: config
};
```
