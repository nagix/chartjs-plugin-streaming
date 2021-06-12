# データを流し込む

定期的に呼び出される `onRefresh` コールバック関数でデータを追加することができます。各データは 2 つのプロパティ（データポイントのタイムスタンプと値）を持ちます。

なお、古いデータはチャートから見えなくなると自動的に削除されます。

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
