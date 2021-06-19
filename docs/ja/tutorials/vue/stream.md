# データを流し込む

コールバック関数でデータを追加し、様々なチャートオプションを指定することができます。ブラウザは自動更新され、ストリーミングチャートが表示されます。カスタマイズのオプションについては Chart.js の[ドキュメント](https://www.chartjs.org/docs/2.9.4)や[サンプル](https://www.chartjs.org/samples/2.9.4)、vue-chartjs の[ドキュメント](https://vue-chartjs.org/#/Home)をご覧ください。

#### src/components/MyChart.vue

```html{10-14,17-21,28-38}
<script>
import { Line } from 'vue-chartjs'
import 'chartjs-plugin-streaming'

export default {
  extends: Line,
  mounted () {
    this.renderChart({
      datasets: [{
        label: 'データセット 1',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [8, 4],
        fill: true,
        data: []
      }, {
        label: 'データセット 2',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        cubicInterpolationMode: 'monotone',
        fill: true,
        data: []
      }]
    }, {
      scales: {
        xAxes: [{
          type: 'realtime',
          realtime: {
            delay: 2000,
            onRefresh: chart => {
              chart.data.datasets.forEach(dataset => {
                dataset.data.push({
                  x: Date.now(),
                  y: Math.random()
                })
              })
            }
          }
        }]
      }
    })
  }
}
</script>
```

...これで完了です！

[GitHub リポジトリ](https://github.com/nagix/chartjs-plugin-streaming)と[サンプル](../../samples)もご覧ください。
