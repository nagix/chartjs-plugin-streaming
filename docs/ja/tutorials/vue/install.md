# モジュールをインストールする

[Chart.js](https://www.chartjs.org)、[vue-chartjs](https://vue-chartjs.org/)、[chartjs-plugin-streaming](https://nagix.github.io/chartjs-plugin-streaming/) をプロジェクトにインストールします。

```bash
$ npm install chart.js@2 vue-chartjs chartjs-plugin-streaming@1 --save
```

::: warning 注意事項
現在、vue-chartjs は Chart.js 2.x のみをサポートしており、3.x はサポートしていません。そのため、Chart.js 2.x および chartjs-plugin-streaming 1.x を明示的にインストールする必要があります。
:::
