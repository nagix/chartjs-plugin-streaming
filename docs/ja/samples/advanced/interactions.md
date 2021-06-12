# インタラクション

```js chart-editor
// <block:setup:1>
const data = {
  datasets: [
    {
      label: 'データセット1 (線形補間)',
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      borderColor: Utils.CHART_COLORS.red,
      borderDash: [8, 4],
      data: []
    },
    {
      label: 'データセット2 (キュービック補間)',
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
      borderColor: Utils.CHART_COLORS.blue,
      cubicInterpolationMode: 'monotone',
      data: []
    }
  ]
};

const onRefresh = chart => {
  const now = Date.now();
  chart.data.datasets.forEach(dataset => {
    dataset.data.push({
      x: now,
      y: Utils.rand(-100, 100)
    });
  });
};
// </block:setup>

// <block:actions:2>
const actions = [
  {
    name: 'duration +1000',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      if (realtimeOpts.duration < 60000) {
        realtimeOpts.duration += 1000;
        chart.update('none');
      }
    }
  },
  {
    name: 'duration -1000',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      if (realtimeOpts.duration > 1000) {
        realtimeOpts.duration -= 1000;
        chart.update('none');
      }
    }
  },
  {
    name: 'ttl +1000',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      if (realtimeOpts.ttl < 60000) {
        realtimeOpts.ttl += 1000;
        chart.update('none');
      }
    }
  },
  {
    name: 'ttl -1000',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      if (realtimeOpts.ttl > 1000) {
        realtimeOpts.ttl -= 1000;
        chart.update('none');
      }
    }
  },
  {
    name: 'refresh +200',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      if (realtimeOpts.refresh < 5000) {
        realtimeOpts.refresh += 200;
        chart.update('none');
      }
    }
  },
  {
    name: 'refresh -200',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      if (realtimeOpts.refresh > 200) {
        realtimeOpts.refresh -= 200;
        chart.update('none');
      }
    }
  },
  {
    name: 'delay +200',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      if (realtimeOpts.delay < 5000) {
        realtimeOpts.delay += 200;
        chart.update('none');
      }
    }
  },
  {
    name: 'delay -200',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      if (realtimeOpts.delay > 0) {
        realtimeOpts.delay -= 200;
        chart.update('none');
      }
    }
  },
  {
    name: 'frameRate: 1',
    handler(chart) {
      chart.options.scales.x.realtime.frameRate = 1;
      chart.update('none');
    }
  },
  {
    name: 'frameRate: 5',
    handler(chart) {
      chart.options.scales.x.realtime.frameRate = 5;
      chart.update('none');
    }
  },
  {
    name: 'frameRate: 30',
    handler(chart) {
      chart.options.scales.x.realtime.frameRate = 30;
      chart.update('none');
    }
  },
  {
    name: 'frameRate: 60',
    handler(chart) {
      chart.options.scales.x.realtime.frameRate = 60;
      chart.update('none');
    }
  },
  {
    name: 'pause オン/オフ',
    handler(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      realtimeOpts.pause = !realtimeOpts.pause;
      chart.update('none');
    }
  }
];
// </block:actions>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    scales: {
      x: {
        type: 'realtime',
        realtime: {
          duration: 20000,
          ttl: 60000,
          refresh: 1000,
          delay: 2000,
          onRefresh: onRefresh,
          frameRate: 30,
          pause: false
        }
      },
      y: {
        title: {
          display: true,
          text: '値'
        }
      }
    },
    interaction: {
      intersect: false
    }
  }
};
// </block:config>

config.plugins = [
  {
    afterDraw(chart) {
      const realtimeOpts = chart.options.scales.x.realtime;
      const ctx = chart.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.moveTo(200, 176);
      ctx.arcTo(70, 176, 70, 40, 10);
      ctx.arcTo(70, 40, 200, 40, 10);
      ctx.arcTo(200, 40, 200, 176, 10);
      ctx.arcTo(200, 176, 70, 176, 10);
      ctx.closePath();
      ctx.fill();
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.textBaseline = 'top';
      ctx.fillText('duration: ' + realtimeOpts.duration, 80, 50);
      ctx.fillText('ttl: ' + realtimeOpts.ttl, 80, 70);
      ctx.fillText('refresh: ' + realtimeOpts.refresh, 80, 90);
      ctx.fillText('delay: ' + realtimeOpts.delay, 80, 110);
      ctx.fillText('frameRate: ' + realtimeOpts.frameRate, 80, 130);
      ctx.fillText('pause: ' + realtimeOpts.pause, 80, 150);
      ctx.restore();
    }
  }
];

config.options.plugins = {
  annotation: false,
  datalabels: false,
  zoom: false
};

module.exports = {
  actions: actions,
  config: config
};
```
