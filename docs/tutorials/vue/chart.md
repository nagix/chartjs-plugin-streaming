# Create a chart component

Now you’ll want to create a chart component named MyChart with a realtime scale. Import the `Line` chart component from vue-chartjs as well as chartjs-plugin-streaming, and extend it.

#### src/components/MyChart.vue

```html
<script>
import { Line } from 'vue-chartjs'
import 'chartjs-plugin-streaming';

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
    });
  }
}
</script>
```
