# チャートコンポーネントを作成する

realtime スケールを持つ MyChart という名前のチャートコンポーネントを作成します。vue-chartjs の `Line` チャートコンポーネント、chartjs-plugin-streaming をインポートして拡張します。

#### src/components/MyChart.vue

```html
<script>
import { Line } from 'vue-chartjs'
import 'chartjs-plugin-streaming'

export default {
  extends: Line,
  mounted () {
    this.renderChart({
      datasets: [{
        data: []
      }, {
        data: []
      }]
    }, {
      scales: {
        xAxes: [{
          type: 'realtime'
        }]
      }
    })
  }
}
</script>
```
