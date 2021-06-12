# データを流し込む

コールバック関数でデータを追加し、様々なチャートオプションを指定することができます。ブラウザは自動更新され、ストリーミングチャートが表示されます。カスタマイズのオプションについては Chart.js の[ドキュメント](https://www.chartjs.org/docs)や[サンプル](https://www.chartjs.org/samples)、react-chartjs-2 の[ドキュメント](https://github.com/reactchartjs/react-chartjs-2)をご覧ください。

#### src/App.js

```jsx{15-19,22-26,34-44}
import React, { Component } from 'react';
import { Line, Chart } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';
import './App.css';

Chart.register(StreamingPlugin);

class App extends Component {
  render() {
    return (
      <Line
        data={{
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
        }}
        options={{
          scales: {
            x: {
              type: 'realtime',
              realtime: {
                delay: 2000,
                onRefresh: chart => {
                  chart.data.datasets.forEach(dataset => {
                    dataset.data.push({
                      x: Date.now(),
                      y: Math.random()
                    });
                  });
                }
              }
            }
          }
        }}
      />
    );
  }
}

export default App;
```

...これで完了です！

[GitHub リポジトリ](https://github.com/nagix/chartjs-plugin-streaming)と[サンプル](../../samples/)もご覧ください。
