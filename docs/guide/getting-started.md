# Getting Started

## Installation

### npm

[![npm](https://img.shields.io/npm/v/chartjs-plugin-streaming.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chartjs-plugin-streaming) [![npm downloads](https://img.shields.io/npm/dm/chartjs-plugin-streaming.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chartjs-plugin-streaming)

```sh
npm install chartjs-plugin-streaming --save
```

::: tip
This plugin can also be installed using [Bower](https://bower.io/).
:::

### CDN

[![jsdelivr](https://img.shields.io/npm/v/chartjs-plugin-streaming.svg?label=jsdelivr&style=flat-square&maxAge=600)](https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@latest/dist/) [![jsdelivr hits](https://data.jsdelivr.com/v1/package/npm/chartjs-plugin-streaming/badge)](https://www.jsdelivr.com/package/npm/chartjs-plugin-streaming)

By default, `https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming` returns the latest (minified) version, however it's [**highly recommended**](https://www.jsdelivr.com/features) to always specify a version in order to avoid breaking changes. This can be achieved by appending `@{version}` to the url:

```
https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2.0.0    // exact version
https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2        // latest 2.x.x
```

Read more about jsDeliver versioning on their [website](http://www.jsdelivr.com/).

### Download

[![github](https://img.shields.io/github/release/nagix/chartjs-plugin-streaming.svg?style=flat-square&maxAge=600)](https://github.com/nagix/chartjs-plugin-streaming/releases/latest) [![github downloads](https://img.shields.io/github/downloads/nagix/chartjs-plugin-streaming/total.svg?style=flat-square&maxAge=600)](http://www.somsubhra.com/github-release-stats/?username=nagix&repository=chartjs-plugin-streaming)

You can download the latest version of `chartjs-plugin-streaming` from the [GitHub Releases](https://github.com/nagix/chartjs-plugin-streaming/releases/latest):

- `chartjs-plugin-streaming.js` (recommended for development)
- `chartjs-plugin-streaming.min.js` (recommended for production)
- `chartjs-plugin-streaming.esm.js`
- `chartjs-plugin-streaming.tgz` (contains all builds)
- `chartjs-plugin-streaming.zip` (contains all builds)

## Integration

### HTML

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.3.2"></script>
<script src="https://cdn.jsdelivr.net/npm/luxon@1.27.0"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.0.0"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2.0.0"></script>
```

::: warning IMPORTANT
`chartjs-plugin-streaming` must be loaded **after** the Chart.js, a date library and a corresponding adapter!
:::

This plugin requires both a date library and a corresponding adapter to be present. [Luxon](https://moment.github.io/luxon/) is used in the example above, but you can choose from the [available adapters](https://github.com/chartjs/awesome#adapters).

Registration is not needed in case of using script tags.

### Module

```javascript
import {Chart} from 'chart.js';
import 'chartjs-adapter-luxon';
import ChartStreaming from 'chartjs-plugin-streaming';

Chart.register(ChartStreaming);
```

Once imported, the plugin needs to be registered globally.

::: warning IMPORTANT
`chartjs-plugin-streaming` does not function as an inline plugin. See also [Chart.js &rsaquo; Using plugins](https://www.chartjs.org/docs/latest/developers/plugins.html).
:::

## Configuration

The [plugin options](options.md) can be changed at 3 different levels and are evaluated with the following priority:

- per axis: `options.scales[scaleId].realtime.*`
- per chart: `options.plugins.streaming.*`
- globally: `Chart.defaults.plugins.streaming.*`

For example:

```js
// Change default options for ALL charts
Chart.defaults.set('plugins.streaming', {
  duration: 20000
});

const chart = new Chart(ctx, {
  options: {
    plugins: {
      // Change options for ALL axes of THIS CHART
      streaming: {
        duration: 20000
      }
    },
    scales: {
      x: {
        type: 'realtime',
        // Change options only for THIS AXIS
        realtime: {
          duration: 20000
        }
      }
    }
  }
});
```
