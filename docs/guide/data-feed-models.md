# Data Feed Models

This plugin supports both pull and push based data feed.

## Pull Model (Polling Based) - Synchronous

In the pull model, the user code needs to ask for new data and pull it from a data source. To enable this, the plugin provides two options: `onRefresh` which is the callback function that is called at a regular interval to check the data source and `refresh` which specifies the interval. In this callback function, you can add data into the existing data array as usual, but you don't need to call the `update` function as it is called internally.

For example:

```js
const myChart = new Chart(ctx, {
  type: 'line',             // 'line', 'bar', 'bubble' and 'scatter' types are supported
  data: {
    datasets: [{
      data: []              // empty at the beginning
    }]
  },
  options: {
    scales: {
      x: {
        type: 'realtime',   // x axis will auto-scroll from right to left
        realtime: {         // per-axis options
          duration: 20000,  // data in the past 20000 ms will be displayed
          refresh: 1000,    // onRefresh callback will be called every 1000 ms
          delay: 1000,      // delay of 1000 ms, so upcoming values are known before plotting a line
          pause: false,     // chart is not paused
          ttl: undefined,   // data will be automatically deleted as it disappears off the chart
          frameRate: 30,    // data points are drawn 30 times every second

          // a callback to update datasets
          onRefresh: chart => {

            // query your data source and get the array of {x: timestamp, y: value} objects
            var data = getLatestData();

            // append the new data array to the existing chart data
            chart.data.datasets[0].data.push(...data);
          }
        }
      }
    }
  }
});
```

## Pull Model (Polling Based) - Asynchronous

If your data source responds to requests asynchronously, you will probably receive the results in a callback function in which you can add data into the existing data array. The `update` function needs to be called after adding new data.

A problem with calling the `update` function for stream data feeds is that it can disrupt smooth transition because an `update` call interrupts the current animation and initiates a new one. To avoid this, this plugin added the `'quiet'` transition mode for the `update` function. If it is specified, the current animation won't be interrupted and new data can be added without initiating a new animation.

This model is suitable for data sources such as web servers, Kafka (REST Proxy), Kinesis (Data Streams API) and other time series databases with REST API support including Elasticsearch, OpenTSDB and Graphite.

For example:

```js
const myChart = new Chart(ctx, {
  options: {
    scales: {
      x: {
        realtime: {
          onRefresh: chart => {
            // request data so that it can be received asynchronously
            // assume the response is an array of {x: timestamp, y: value} objects
            fetch(YOUR_DATA_SOURCE_URL)
              .then(response => response.json())
              .then(data => {
                // append the new data array to the existing chart data
                chart.data.datasets[0].data.push(...data);

                // update chart datasets keeping the current animation
                chart.update('quiet');
              });
          }
        }
      }
    }
  }
});
```

## Push Model (Listening Based)

In the push model, the user code registers a listener that waits for new data, and data can be picked up immediately after it arrives. Usually, data source connector libraries that support the push model provide a listener callback function in which you can add data into the existing data array. `onRefresh` is unnecessary in this model, but the `update` function needs to be called after adding new data like asynchronous pull model.

This model is suitable for data sources such as WebSocket, MQTT, Kinesis (Client Library) and other realtime messaging services including Socket.IO, Pusher and Firebase.

Here is an example of a listener function:

```js
// save the chart instance to a variable
var myChart = new Chart(ctx, config);

// your event listener code - assuming the event object has the timestamp and value properties
function onReceive(event) {

  // append the new data to the existing chart data
  myChart.data.datasets[0].data.push({
    x: event.timestamp,
    y: event.value
  });

  // update chart datasets keeping the current animation
  myChart.update('quiet');
}
```
