# 遅延を追加する

先ほどのチャートには少し問題があります。次のデータポイントが得られない限り、線をプロットすることができません。これを回避するために、チャートに遅延を追加して線をプロットする時点で次の値が得られているようにします。

このようにして、右端で飛び飛びの挙動をすることなく途切れずに流れるようなチャートを作ることができます。

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
