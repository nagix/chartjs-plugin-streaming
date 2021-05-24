# Create a chart component

Now you’ll want to create a chart component with a realtime scale. Import chartjs-plugin-streaming and register it in `componentWillMount`. Also, import the `Line` chart component from react-chartjs-2 and render it specifying datasets and options.

#### src/App.js

```jsx
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
