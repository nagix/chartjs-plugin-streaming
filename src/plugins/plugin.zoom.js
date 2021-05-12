import {each} from 'chart.js/helpers';
import {clamp, resolveOption} from '../helpers/helpers.streaming';

const chartStates = new WeakMap();

function getState(chart) {
  let state = chartStates.get(chart);

  if (!state) {
    state = {originalScaleOptions: {}};
    chartStates.set(chart, state);
  }
  return state;
}

function removeState(chart) {
  chartStates.delete(chart);
}

function storeOriginalScaleOptions(chart) {
  const {originalScaleOptions} = getState(chart);
  const scales = chart.scales;

  each(scales, scale => {
    const id = scale.id;

    if (!originalScaleOptions[id]) {
      originalScaleOptions[id] = {
        duration: resolveOption(scale, 'duration'),
        delay: resolveOption(scale, 'delay')
      };
    }
  });
  each(originalScaleOptions, (opt, key) => {
    if (!scales[key]) {
      delete originalScaleOptions[key];
    }
  });
  return originalScaleOptions;
}

function zoomRealTimeScale(scale, zoom, center, limits) {
  const {chart, axis} = scale;
  const {minDuration = 0, maxDuration = Infinity, minDelay = -Infinity, maxDelay = Infinity} = limits && limits[axis] || {};
  const realtimeOpts = scale.options.realtime;
  const duration = resolveOption(scale, 'duration');
  const delay = resolveOption(scale, 'delay');
  const newDuration = clamp(duration * (2 - zoom), minDuration, maxDuration);
  let maxPercent, newDelay;

  storeOriginalScaleOptions(chart);

  if (scale.isHorizontal()) {
    maxPercent = (scale.right - center.x) / (scale.right - scale.left);
  } else {
    maxPercent = (scale.bottom - center.y) / (scale.bottom - scale.top);
  }
  newDelay = delay + maxPercent * (duration - newDuration);
  realtimeOpts.duration = newDuration;
  realtimeOpts.delay = clamp(newDelay, minDelay, maxDelay);
  return newDuration !== scale.max - scale.min;
}

function panRealTimeScale(scale, delta, limits) {
  const {chart, axis} = scale;
  const {minDelay = -Infinity, maxDelay = Infinity} = limits && limits[axis] || {};
  const delay = resolveOption(scale, 'delay');
  const newDelay = delay + (scale.getValueForPixel(delta) - scale.getValueForPixel(0));

  storeOriginalScaleOptions(chart);

  scale.options.realtime.delay = clamp(newDelay, minDelay, maxDelay);
  return true;
}

function resetRealTimeScaleOptions(chart) {
  const originalScaleOptions = storeOriginalScaleOptions(chart);

  each(chart.scales, scale => {
    const realtimeOptions = scale.options.realtime;

    if (realtimeOptions) {
      const original = originalScaleOptions[scale.id];

      if (original) {
        realtimeOptions.duration = original.duration;
        realtimeOptions.delay = original.delay;
      } else {
        delete realtimeOptions.duration;
        delete realtimeOptions.delay;
      }
    }
  });
}

function initZoomPlugin(plugin) {
  plugin.zoomFunctions.realtime = zoomRealTimeScale;
  plugin.panFunctions.realtime = panRealTimeScale;
}

export function attachChart(plugin, chart) {
  const streaming = chart.$streaming;

  if (streaming.zoomPlugin !== plugin) {
    const resetZoom = streaming.resetZoom = chart.resetZoom;

    initZoomPlugin(plugin);
    chart.resetZoom = transition => {
      resetRealTimeScaleOptions(chart);
      resetZoom(transition);
    };
    streaming.zoomPlugin = plugin;
  }
}

export function detachChart(chart) {
  const streaming = chart.$streaming;

  if (streaming.zoomPlugin) {
    chart.resetZoom = streaming.resetZoom;
    removeState(chart);
    delete streaming.resetZoom;
    delete streaming.zoomPlugin;
  }
}
