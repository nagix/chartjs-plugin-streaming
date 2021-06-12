# データを流し込む

コールバック関数でデータを追加し、様々なチャートオプションを指定することができます。ブラウザは自動更新され、ストリーミングチャートが表示されます。カスタマイズのオプションについては Chart.js の[ドキュメント](https://www.chartjs.org/docs)や[サンプル](https://www.chartjs.org/samples)、ng2-charts の[ドキュメント](https://valor-software.com/ng2-charts/)をご覧ください。

#### src/app/app.component.ts

```ts{15-19,22-26,33-43}
import { Component } from '@angular/core';
import { Chart, ChartDataset, ChartOptions } from 'chart.js';
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';

Chart.register(StreamingPlugin);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public datasets: ChartDataset[] = [{
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
  }];
  public options: ChartOptions = {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          delay: 2000,
          onRefresh: (chart: Chart) => {
            chart.data.datasets.forEach((dataset: ChartDataset) => {
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

...これで完了です！

[GitHub リポジトリ](https://github.com/nagix/chartjs-plugin-streaming)と[サンプル](../../samples/)もご覧ください。
