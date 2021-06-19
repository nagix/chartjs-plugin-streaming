# Stream data

You can append the data in the callback function and add more chart options. The browser refreshes and displays a live streaming chart. See the Chart.js [documentation](https://www.chartjs.org/docs/2.9.4), [samples](https://www.chartjs.org/samples/2.9.4) and vue-chartjs [documentation](https://vue-chartjs.org/#/Home) for the customization options.

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
        label: 'Dataset 1',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [8, 4],
        fill: true,
        data: []
      }, {
        label: 'Dataset 2',
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

...and you're done!

See also [GitHub repository](https://github.com/nagix/chartjs-plugin-streaming) and [samples](../../samples).
