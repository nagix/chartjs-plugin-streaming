# Zoom

[chartjs-plugin-zoom](https://github.com/chartjs/chartjs-plugin-zoom) との連携

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
  },
  {
    name: 'ズームリセット',
    handler(chart) {
      chart.resetZoom('none');
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
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x'
        },
        zoom: {
          pinch: {
            enabled: true
          },
          wheel: {
            enabled: true
          },
          mode: 'x'
        },
        limits: {
          x: {
            minDelay: 0,
            maxDelay: 4000,
            minDuration: 1000,
            maxDuration: 20000
          }
        }
      }
    }
  }
};
// </block:config>

const pluginOpts = config.options.plugins;
pluginOpts.annotation = false;
pluginOpts.datalabels = false;

module.exports = {
  actions: actions,
  config: config
};
```

プレーンな JavaScript の場合、script タグを以下の順序で指定します。

```html
<script src="path/to/chartjs/dist/chart.min.js"></script>
<script src="path/to/luxon/dist/luxon.min.js"></script>
<script src="path/to/chartjs-adapter-luxon/dist/chartjs-adapter-luxon.min.js"></script>
<script src="path/to/chartjs-plugin-annotation/dist/chartjs-plugin-zoom.min.js"></script>
<script src="path/to/chartjs-plugin-streaming/dist/chartjs-plugin-streaming.min.js"></script>
```

バンドラーを使う場合は、モジュールをインポートしてチャートに登録します。

```js
import {Chart} from 'chart.js';
import 'chartjs-adapter-luxon';
import ZoomPlugin from 'chartjs-plugin-zoom';
import StreamingPlugin from 'chartjs-plugin-streaming';

Chart.register(ZoomPlugin, StreamingPlugin);
````
