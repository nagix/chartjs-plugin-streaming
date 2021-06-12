# チャートを作成する

これでチャートを作成することができます。スクリプトをページに追加します。今のところはデフォルト設定を使います。これは後で変更することが可能です。

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
        type: 'realtime'
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

```js
const myChart = new Chart(
  document.getElementById('myChart'),
  config
);
```
