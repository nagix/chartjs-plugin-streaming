# Performance

## Lowering CPU Usage

If you are using this plugin on resource constrained devices or drawing multiple charts on a large screen, it might be a good idea to decrease the frame rate to lower CPU usage. The following settings also reduce CPU usage by disabling animations, and improve general page performance.

```js
const myChart = new Chart(ctx, {
  options: {
    animation: false,  // disable animations
    plugins: {
      streaming: {
        frameRate: 5   // chart is drawn 5 times every second
      }
    }
  }
});
```
