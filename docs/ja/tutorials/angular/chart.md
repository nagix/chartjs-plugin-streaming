# チャートを作成する

そして、コンポーネントクラスはこのようになります。chartjs-plugin-streaming をインポートして登録します。コンポーネントクラスの中で、データセットおよび realtime スケールのオプションを定義します。

#### src/app/app.component.ts

```ts
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
    data: []
  }, {
    data: []
  }];
  public options: ChartOptions = {
    scales: {
      x: {
        type: 'realtime'
      }
    }
  };
}
```
