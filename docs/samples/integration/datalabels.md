# Data Labels

Integration with [chartjs-plugin-datalabels](https://github.com/chartjs/chartjs-plugin-datalabels)

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

const onRefresh = chart => {
  const now = Date.now();
  chart.data.datasets.forEach(dataset => {
    dataset.data.push({
      x: now,
      y: Math.round(Utils.rand(-100, 100))
    });
  });
};
// </block:setup>

// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data.forEach(dataObj => {
          dataObj.y = Math.round(Utils.rand(-100, 100));
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
          text: 'Value'
        }
      }
    },
    interaction: {
      intersect: false
    },
    plugins: {
      datalabels: {
        backgroundColor: context => context.dataset.borderColor,
        padding: 4,
        borderRadius: 4,
        clip: true,
        color: 'white',
        font: {
          weight: 'bold'
        },
        formatter: value => value.y
      }
    }
  }
};
// </block:config>

const pluginOpts = config.options.plugins;
pluginOpts.annotation = false;
pluginOpts.zoom = false;

module.exports = {
  actions: actions,
  config: config
};
```

For plain JavaScript, use script tags in the following order.

```html
<script src="path/to/chartjs/dist/chart.min.js"></script>
<script src="path/to/luxon/dist/luxon.min.js"></script>
<script src="path/to/chartjs-adapter-luxon/dist/chartjs-adapter-luxon.min.js"></script>
<script src="path/to/chartjs-plugin-annotation/dist/chartjs-plugin-datalabels.min.js"></script>
<script src="path/to/chartjs-plugin-streaming/dist/chartjs-plugin-streaming.min.js"></script>
```

For bundlers, import and register modules to the chart.

```js
import {Chart} from 'chart.js';
import 'chartjs-adapter-luxon';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import StreamingPlugin from 'chartjs-plugin-streaming';

Chart.register(DataLabelsPlugin, ...StreamingPlugin);
````
