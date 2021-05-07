import {defaults, registry} from 'chart.js';
import {each, noop, getRelativePosition, clipArea, unclipArea} from 'chart.js/helpers';
import {resolveOption, getAxisMap, startFrameRefreshTimer, stopFrameRefreshTimer} from '../helpers/helpers.streaming';
import {attachChart as annotationAttachChart, detachChart as annotationDetachChart} from '../plugins/plugin.annotation';
import {updateTooltip} from '../plugins/plugin.tooltip';
import {attachChart as zoomAttachChart, detachChart as zoomDetachChart} from '../plugins/plugin.zoom';
import RealTimeScale from '../scales/scale.realtime';
import {version} from '../../package.json';

defaults.set('transitions', {
  quiet: {
    animation: {
      duration: 0
    }
  }
});

const transitionKeys = {x: ['x'], y: ['y']};

function updateElements(chart) {
  each(chart.data.datasets, (dataset, datasetIndex) => {
    const meta = chart.getDatasetMeta(datasetIndex);
    const {data: elements = [], dataset: element} = meta;

    for (let i = 0, ilen = elements.length; i < ilen; ++i) {
      elements[i].$streaming = getAxisMap(elements[i], transitionKeys, meta);
    }
    if (element) {
      element.$streaming = getAxisMap(element, transitionKeys, meta);
    }
  });
}

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
  },

  afterInit(chart) {
    const {update, render, tooltip} = chart;

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

    if (tooltip) {
      const tooltipUpdate = tooltip.update;

      tooltip.update = (...args) => {
        updateTooltip(tooltip);
        tooltipUpdate.call(tooltip, ...args);
      };
    }
  },

  beforeUpdate(chart) {
    const chartOpts = chart.options;
    const scalesOpts = chartOpts.scales;

    each(scalesOpts, scaleOpts => {
      if (scaleOpts.type === 'realtime') {
        // Allow Bézier control to be outside the chart
        chartOpts.elements.line.capBezierPoints = false;
      }
    });

    try {
      const plugin = registry.getPlugin('annotation');
      annotationAttachChart(plugin, chart);
    } catch (e) {
      annotationDetachChart(chart);
    }

    try {
      const plugin = registry.getPlugin('zoom');
      zoomAttachChart(plugin, chart);
    } catch (e) {
      zoomDetachChart(chart);
    }

    return true;
  },

  afterUpdate(chart) {
    const {scales, streaming} = chart;
    let pause = true;

    updateElements(chart);

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
