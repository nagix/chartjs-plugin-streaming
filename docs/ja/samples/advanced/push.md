# プッシュデータフィード

```js chart-editor
// <block:setup:1>
const data = {
  datasets: [
    {
      label: 'データセット1 (線形補間)',
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      borderColor: Utils.CHART_COLORS.red,
      borderDash: [8, 4],
      data: []
    },
    {
      label: 'データセット2 (キュービック補間)',
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
    name: 'ランダム化',
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
    name: 'データセット追加',
    handler(chart) {
      const datasets = chart.data.datasets;
      const dsColor = Utils.namedColor(datasets.length);
      const newDataset = {
        label: 'データセット' + (datasets.length + 1),
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
    name: 'データ追加',
    handler(chart) {
      onRefresh(chart);
      chart.update();
    }
  },
  {
    name: 'データセット削除',
    handler(chart) {
      stopFeed(chart.data.datasets.length - 1);
      chart.data.datasets.pop();
      chart.update();
    }
  },
  {
    name: 'データ削除',
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
          text: '値'
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
