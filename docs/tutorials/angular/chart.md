# Create a chart

And, here’s what it can look like in our component class. Import chartjs-plugin-streaming and register it in the constructor. In the component class, define datasets and options with a realtime scale.

#### src/app/app.component.ts

```ts
import { Component } from '@angular/core';
import { Chart } from 'chart.js';
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public datasets: any[] = [{
    data: []
  }, {
    data: []
  }];
  public options: any = {
    scales: {
      x: {
        type: 'realtime'
      }
    }
  };
  constructor() {
    Chart.register(StreamingPlugin);
  }
}
```
