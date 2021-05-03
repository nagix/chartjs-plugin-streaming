import {registry} from 'chart.js';
import {each, noop, getRelativePosition, clipArea, unclipArea} from 'chart.js/helpers';
import {resolveOption, startFrameRefreshTimer, stopFrameRefreshTimer} from '../helpers/helpers.streaming';
import {zoomRealTimeScale, panRealTimeScale, resetRealTimeOptions} from '../plugins/plugin.zoom';
import RealTimeScale from '../scales/scale.realtime';
import {version} from '../../package.json';

// Draw chart at frameRate
function drawChart(chart) {
  const streaming = chart.streaming;
  const frameRate = chart.options.plugins.streaming.frameRate;
  const frameDuration = 1000 / (Math.max(frameRate, 0) || 30);
  const next = streaming.lastDrawn + frameDuration || 0;
  const now = Date.now();

  if (next <= now) {
    chart.render();
    if (streaming.lastMouseEvent) {
      setTimeout(() => {
        const lastMouseEvent = streaming.lastMouseEvent;
        if (lastMouseEvent) {
          chart._eventHandler(lastMouseEvent);
        }
      }, 0);
    }
    streaming.lastDrawn = (next + frameDuration > now) ? next : now;
  }
}

export default {
  id: 'streaming',

  version,

  beforeInit(chart) {
    const streaming = chart.streaming = chart.streaming || {};
    const canvas = streaming.canvas = chart.canvas;
    const mouseEventListener = streaming.mouseEventListener = event => {
      const pos = getRelativePosition(event, chart);
      streaming.lastMouseEvent = {
        type: 'mousemove',
        chart: chart,
        native: event,
        x: pos.x,
        y: pos.y
      };
    };

    canvas.addEventListener('mousedown', mouseEventListener);
    canvas.addEventListener('mouseup', mouseEventListener);

    chart.options.transitions.quiet = {
      animation: {
        duration: 0
      }
    };
  },

  afterInit(chart) {
    const {update, render, resetZoom} = chart;

    chart.update = mode => {
      if (mode === 'quiet') {
        // Skip the render call in the quiet mode
        chart.render = noop;
        update.call(chart, mode);
        chart.render = render;
      } else {
        update.call(chart, mode);
      }
    };

    if (resetZoom) {
      const zoomPlugin = registry.getPlugin('zoom');

      zoomPlugin.zoomFunctions.realtime = zoomRealTimeScale;
      zoomPlugin.panFunctions.realtime = panRealTimeScale;
      chart.resetZoom = transition => {
        resetRealTimeOptions(chart);
        resetZoom(transition);
      };
    }
  },

  beforeUpdate(chart) {
    const chartOpts = chart.options;
    const scalesOpts = chartOpts.scales;

    if (scalesOpts) {
      Object.keys(scalesOpts).forEach(id => {
        const scaleOpts = scalesOpts[id];

        if (scaleOpts.type === 'realtime') {
          // Allow Bézier control to be outside the chart
          chartOpts.elements.line.capBezierPoints = false;
        }
      });
    }
    return true;
  },

  afterUpdate(chart) {
    const {scales, streaming} = chart;
    let pause = true;

    // if all scales are paused, stop refreshing frames
    each(scales, scale => {
      if (scale instanceof RealTimeScale) {
        pause &= resolveOption(scale, 'pause');
      }
    });
    if (pause) {
      stopFrameRefreshTimer(streaming);
    } else {
      startFrameRefreshTimer(streaming, () => {
        drawChart(chart);
      });
    }
  },

  beforeDatasetDraw(chart, args) {
    const {ctx, chartArea, width, height} = chart;
    const {xAxisID, yAxisID, controller} = args.meta;
    const area = {
      left: 0,
      top: 0,
      right: width,
      bottom: height
    };

    if (xAxisID && controller.getScaleForId(xAxisID) instanceof RealTimeScale) {
      area.left = chartArea.left;
      area.right = chartArea.right;
    }
    if (yAxisID && controller.getScaleForId(yAxisID) instanceof RealTimeScale) {
      area.top = chartArea.top;
      area.bottom = chartArea.bottom;
    }
    clipArea(ctx, area);
    return true;
  },

  afterDatasetDraw(chart) {
    unclipArea(chart.ctx);
  },

  beforeEvent(chart, args) {
    const streaming = chart.streaming;
    const event = args.event;

    if (event.type === 'mousemove') {
      // Save mousemove event for reuse
      streaming.lastMouseEvent = event;
    } else if (event.type === 'mouseout') {
      // Remove mousemove event
      delete streaming.lastMouseEvent;
    }
    return true;
  },

  destroy(chart) {
    const {scales, streaming} = chart;
    const {canvas, mouseEventListener} = streaming;

    stopFrameRefreshTimer(streaming);

    canvas.removeEventListener('mousedown', mouseEventListener);
    canvas.removeEventListener('mouseup', mouseEventListener);

    each(scales, scale => {
      if (scale instanceof RealTimeScale) {
        scale.destroy();
      }
    });
  },

  defaults: {
    duration: 10000,
    delay: 0,
    frameRate: 30,
    refresh: 1000,
    onRefresh: null,
    pause: false,
    ttl: undefined
  },

  descriptors: {
    _scriptable: name => name !== 'onRefresh'
  }
};
