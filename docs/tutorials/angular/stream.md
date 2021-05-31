# Stream data

You can append the data in the callback function and add more chart options. The browser refreshes and displays a live streaming chart. See the Chart.js [documentation](https://www.chartjs.org/docs), [samples](https://www.chartjs.org/samples) and ng2-charts [documentation](https://valor-software.com/ng2-charts/) for the customization options.

#### src/app/app.component.ts

```ts{13-17,20-24,31-41}
import { Component } from '@angular/core';
import { Chart } from 'chart.js';
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';

Chart.register(StreamingPlugin);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public datasets: any[] = [{
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
  }];
  public options: any = {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          delay: 2000,
          onRefresh: (chart: any) => {
            chart.data.datasets.forEach((dataset: any) => {
              dataset.data.push({
                x: Date.now(),
                y: Math.random()
              });
            });
          }
        }
      }
    }
  };
}
```

...and you're done!

See also [GitHub repository](https://github.com/nagix/chartjs-plugin-streaming) and [samples](../../samples/).
