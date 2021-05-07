import {each, noop, isFinite, requestAnimFrame, valueOrDefault} from 'chart.js/helpers';

export function clamp(value, lower, upper) {
  return Math.min(Math.max(value, lower), upper);
}

export function resolveOption(scale, key) {
  const realtimeOpts = scale.options.realtime;
  const streamingOpts = scale.chart.options.plugins.streaming;
  return valueOrDefault(realtimeOpts[key], streamingOpts[key]);
}

export function getAxisMap(element, {x, y}, {xAxisID, yAxisID}) {
  const axisMap = {};

  each(x, key => {
    if (isFinite(element[key])) {
      axisMap[key] = {axisId: xAxisID};
    }
  });
  each(y, key => {
    if (isFinite(element[key])) {
      axisMap[key] = {axisId: yAxisID};
    }
  });
  return axisMap;
}

/**
* Cancel animation polyfill
*/
export const cancelAnimFrame = (function() {
  if (typeof window === 'undefined') {
    return noop;
  }
  return window.cancelAnimationFrame;
}());

export function startFrameRefreshTimer(context, func) {
  if (!context.frameRequestID) {
    const frameRefresh = function() {
      func();
      context.frameRequestID = requestAnimFrame.call(window, frameRefresh);
    };
    context.frameRequestID = requestAnimFrame.call(window, frameRefresh);
  }
}

export function stopFrameRefreshTimer(context) {
  const frameRequestID = context.frameRequestID;

  if (frameRequestID) {
    cancelAnimFrame.call(window, frameRequestID);
    delete context.frameRequestID;
  }
}
