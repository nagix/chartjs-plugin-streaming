# Create a chart

Now, we can create a chart. We add a script to our page. Use the default settings for now. These can be tweaked later.

```js chart-editor
// <block:config>
const config = {
  type: 'line',
  data: {
    datasets: [
      {
        data: []
      },
      {
        data: []
      }
    ]
  },
  options: {
    scales: {
      x: {
        type: 'realtime'
      }
    }
  }
};
// </block:config>

config.options.plugins = {
  annotation: false,
  datalabels: false,
  zoom: false
};

module.exports = {
  config: config
};
```

```js
const myChart = new Chart(
  document.getElementById('myChart'),
  config
);
```
