# Stream data

You can append the data in the callback function and add more chart options. The browser refreshes and displays a live streaming chart. See the Chart.js [documentation](https://www.chartjs.org/docs), [samples](https://www.chartjs.org/samples) and react-chartjs-2 [documentation](https://github.com/reactchartjs/react-chartjs-2) for the customization options.

#### src/App.js

```jsx{16-19,22-25,33-43}
import React, { Component } from 'react';
import { Line, Chart } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
import StreamingPlugin from 'chartjs-plugin-streaming';
import './App.css';

class App extends Component {
  componentWillMount() {
    Chart.register(StreamingPlugin);
  }
  render() {
    return (
      <Line
        data={{
          datasets: [{
            label: 'Dataset 1',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [8, 4],
            data: []
          }, {
            label: 'Dataset 2',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            cubicInterpolationMode: 'monotone',
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

...and you're done!</h4>

See also [GitHub repository](https://github.com/nagix/chartjs-plugin-streaming) and [samples](../../samples/).
