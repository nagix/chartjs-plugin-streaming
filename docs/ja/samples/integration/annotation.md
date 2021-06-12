# Annotation

[chartjs-plugin-annotation](https://github.com/chartjs/chartjs-plugin-annotation) との連携

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
  const box = chart.options.plugins.annotation.annotations.box;
  const now = Date.now();
  chart.data.datasets.forEach(dataset => {
    dataset.data.push({
      x: now,
      y: Utils.rand(-100, 100)
    });
  });
  if (!(box.xMax >= now - 22000)) {
    box.xMin = now - 2000;
    box.xMax = now + 8000;
    box.yMin = Utils.rand(-100, 100);
    box.yMax = Utils.rand(-100, 100);
    chart.update('none');
  }
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
    },
    plugins: {
      annotation: {
        annotations: {
          line: {
            drawTime: 'afterDatasetsDraw',
            type: 'line',
            scaleID: 'y',
            value: Utils.rand(-100, 100),
            borderColor: 'black',
            borderWidth: 5,
            label: {
              backgroundColor: 'red',
              content: 'Test Label',
              enabled: true
            }
          },
          box: {
            drawTime: 'beforeDatasetsDraw',
            type: 'box',
            xMin: 0,
            xMax: 0,
            backgroundColor: Utils.transparentize(Utils.CHART_COLORS.purple, 0.5),
            borderColor: Utils.CHART_COLORS.purple,
            borderWidth: 1
          }
        }
      }
    }
  }
};
// </block:config>

const pluginOpts = config.options.plugins;
pluginOpts.datalabels = false;
pluginOpts.zoom = false;

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
<script src="path/to/chartjs-plugin-annotation/dist/chartjs-plugin-annotation.min.js"></script>
<script src="path/to/chartjs-plugin-streaming/dist/chartjs-plugin-streaming.min.js"></script>
```

バンドラーを使う場合は、モジュールをインポートしてチャートに登録します。

```js
import {Chart} from 'chart.js';
import 'chartjs-adapter-luxon';
import AnnotationPlugin from 'chartjs-plugin-annotation';
import StreamingPlugin from 'chartjs-plugin-streaming';

Chart.register(AnnotationPlugin, StreamingPlugin);
````
