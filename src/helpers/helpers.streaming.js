import {noop, requestAnimFrame, valueOrDefault} from 'chart.js/helpers';

export function clamp(value, lower, upper) {
  return Math.min(Math.max(value, lower), upper);
}

export function resolveOption(scale, key) {
  const realtimeOpts = scale.options.realtime;
  const streamingOpts = scale.chart.options.plugins.streaming;
  return valueOrDefault(realtimeOpts[key], streamingOpts[key]);
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
