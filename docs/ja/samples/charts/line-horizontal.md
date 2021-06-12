# ライン (水平スクロール)

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

const onRefresh = chart => {
  const now = Date.now();
  chart.data.datasets.forEach(dataset => {
    dataset.data.push({
      x: now,
      y: Utils.rand(-100, 100)
    });
  });
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
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 20000,
          refresh: 1000,
          delay: 2000,
          onRefresh: onRefresh
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
