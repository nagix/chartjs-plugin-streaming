import {each} from 'chart.js/helpers';
import {clamp, resolveOption} from '../helpers/helpers.streaming';

const chartStates = new WeakMap();

function getState(chart) {
  let state = chartStates.get(chart);

  if (!state) {
    state = {originalScaleLimits: {}};
    chartStates.set(chart, state);
  }
  return state;
}

function storeOriginalScaleLimits(chart) {
  const {originalScaleLimits} = getState(chart);
  const scales = chart.scales;

  each(scales, scale => {
    const id = scale.id;

    if (!originalScaleLimits[id]) {
      originalScaleLimits[id] = {
        duration: resolveOption(scale, 'duration'),
        delay: resolveOption(scale, 'delay')
      };
    }
  });
  each(originalScaleLimits, (opt, key) => {
    if (!scales[key]) {
      delete originalScaleLimits[key];
    }
  });
  return originalScaleLimits;
}

export function zoomRealTimeScale(scale, zoom, center, limits) {
  const {chart, axis} = scale;
  const {minDuration = 0, maxDuration = Infinity, minDelay = -Infinity, maxDelay = Infinity} = limits && limits[axis] || {};
  const realtimeOpts = scale.options.realtime;
  const duration = resolveOption(scale, 'duration');
  const delay = resolveOption(scale, 'delay');
  const newDuration = clamp(duration * (2 - zoom), minDuration, maxDuration);
  let maxPercent, newDelay;

  storeOriginalScaleLimits(chart);

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

export function panRealTimeScale(scale, delta, limits) {
  const {chart, axis} = scale;
  const {minDelay = -Infinity, maxDelay = Infinity} = limits && limits[axis] || {};
  const delay = resolveOption(scale, 'delay');
  const newDelay = delay + (scale.getValueForPixel(delta) - scale.getValueForPixel(0));

  storeOriginalScaleLimits(chart);

  scale.options.realtime.delay = clamp(newDelay, minDelay, maxDelay);
  return true;
}

export function resetRealTimeOptions(chart) {
  const originalScaleLimits = storeOriginalScaleLimits(chart);

  each(chart.scales, scale => {
    const realtimeOptions = scale.options.realtime;

    if (realtimeOptions) {
      const original = originalScaleLimits[scale.id];

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
