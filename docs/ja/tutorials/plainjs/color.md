# 色をつける

目盛り、ツールチップ、ラベル、色、カスタムアクションなど、Chart.js が提供するたくさんの設定オプションは、チャートをカスタマイズするのに役立ちます。詳細は Chart.js の[ドキュメント](https://www.chartjs.org/docs)や[サンプル](https://www.chartjs.org/samples)をご覧ください。

```js chart-editor
// <block:config>
const config = {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'データセット 1',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [8, 4],
        fill: true,
        data: []
      },
      {
        label: 'データセット 2',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        cubicInterpolationMode: 'monotone',
        fill: true,
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

...これで完了です！

[GitHub リポジトリ](https://github.com/nagix/chartjs-plugin-streaming)と[サンプル](../../samples/)もご覧ください。
