# Migration

## Migrating to v2.0.0

### Breaking Changes

Make sure to also read the [Chart.js v3 migration guide](https://www.chartjs.org/docs/latest/getting-started/v3-migration.html) since you may be impacted by more general breaking changes due to this new Chart.js version.

#### Explicit Plugin Registration

As described in the [getting started](getting-started.md#module), it's now required to manually register this plugin when building using module bundlers:

```js
import {Chart} from 'chart.js';
import ChartStreaming from 'chartjs-plugin-streaming';

Chart.register(ChartStreaming);
```

#### Default Options

The plugin default options are now accessible in `Chart.defaults.plugins.streaming.*` instead of `Chart.defaults.global.plugins.streaming.*` and can be modified using:

```js
Chart.defaults.set('plugins.streaming', {
  duration: 20000,
  // ...
});
```

See [Getting Started &rsaquo; Configuration](getting-started.html#configuration) for details.

#### Time scale override

Due to historical reasons, auto-scrolling was enabled for not only 'realtime' scales but also 'time' scales in the previous version. In version 2.x, auto-scrolling is enabled only for 'realtime' scales.

#### Transition Mode for Update

When you append data outside the `onRefresh` callback function, `chart.update()` needs to be called explicitly. To avoid interrupting the current animation, the previous version provided support for the `preservation` config property for the `update` function, but it is no longer supported.

Chart.js v3 introduced the transition mode argument, and this plugin now supports the `'quiet'` mode for this purpose.

```js
chart.update('quiet');
```

See [Data Feed Models &rsaquo; Pull Model (Polling Based) - Asynchronous](data-feed-models.html#pull-model-polling-based-asynchronous) for details.

