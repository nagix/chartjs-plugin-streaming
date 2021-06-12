# チャートを作成する

realtime スケールを持つチャートコンポーネントを作成します。chartjs-plugin-streaming をインポートして登録します。また、react-chartjs-2 の `Line` チャートコンポーネントをインポートし、データセットとオプションを指定して描画します。

#### src/App.js

```jsx
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
            data: []
          }, {
            data: []
          }]
        }}
        options={{
          scales: {
            x: {
              type: 'realtime'
            }
          }
        }}
      />
    );
  }
}

export default App;
```
