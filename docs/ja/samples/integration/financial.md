# Financial

[chartjs-chart-financial](https://github.com/chartjs/chartjs-chart-financial) との連携

```js chart-editor
// <block:setup:1>
const data = {
  datasets: [
    {
      data: []
    }
  ]
};

const onRefresh = chart => {
  const _data = chart.data.datasets[0].data;
  let t = Date.now();
  let last;

  t -= t % 5000;
  if (_data.length === 0) {
    _data.push({x: t - 5000, o: 99, h: 101, l: 98, c: 100});
  }
  last = _data[_data.length - 1];
  if (t !== last.x) {
    const c = last.c;
    last = {x: t, o: c, h: c, l: c, c: c};
    _data.push(last);
  }
  last.c = +(last.c + Utils.rand(-0.5, 0.5)).toFixed(2);
  last.h = +Math.max(last.h, last.c).toFixed(2);
  last.l = +Math.min(last.l, last.c).toFixed(2);
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'candlestick',
  data: data,
  options: {
    scales: {
      x: {
        type: 'realtime',
        ticks: {
          source: 'auto'
        },
        realtime: {
          duration: 120000,
          refresh: 500,
          delay: 0,
          onRefresh: onRefresh
        }
      }
    },
    interaction: {
      intersect: false
    },
    animation: {
      duration: 0
    },
    plugins: {
      legend: {
        display: false,
      }
    }
  },
};
// </block:config>

const pluginOpts = config.options.plugins;
pluginOpts.annotation = false;
pluginOpts.datalabels = false;
pluginOpts.zoom = false;

module.exports = {
  config: config
};
```

プレーンな JavaScript の場合、script タグを以下の順序で指定します。

```html
<script src="path/to/chartjs/dist/chart.min.js"></script>
<script src="path/to/luxon/dist/luxon.min.js"></script>
<script src="path/to/chartjs-adapter-luxon/dist/chartjs-adapter-luxon.min.js"></script>
<script src="path/to/chartjs-chart-financial/dist/chartjs-chart-financial.min.js"></script>
<script src="path/to/chartjs-plugin-streaming/dist/chartjs-plugin-streaming.min.js"></script>
```
