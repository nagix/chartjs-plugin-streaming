import {Chart, DatasetController, defaults, registry} from 'chart.js';
import {each, noop, getRelativePosition, clipArea, unclipArea} from 'chart.js/helpers';
import {getAxisMap} from '../helpers/helpers.streaming';
import {attachChart as annotationAttachChart, detachChart as annotationDetachChart} from '../plugins/plugin.annotation';
import {update as tooltipUpdate} from '../plugins/plugin.tooltip';
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

const transitionKeys = {x: ['x', 'cp1x', 'cp2x'], y: ['y', 'cp1y', 'cp2y']};

function update(mode) {
  const me = this;

  if (mode === 'quiet') {
    each(me.data.datasets, (dataset, datasetIndex) => {
      const controller = me.getDatasetMeta(datasetIndex).controller;

      // Set transition mode to 'quiet'
      controller._setStyle = function(element, index, _mode, active) {
        DatasetController.prototype._setStyle.call(this, element, index, 'quiet', active);
      };
    });
  }

  Chart.prototype.update.call(me, mode);

  if (mode === 'quiet') {
    each(me.data.datasets, (dataset, datasetIndex) => {
      delete me.getDatasetMeta(datasetIndex).controller._setStyle;
    });
  }
}

function render(chart) {
  const streaming = chart.$streaming;

  chart.render();

  if (streaming.lastMouseEvent) {
    setTimeout(() => {
      const lastMouseEvent = streaming.lastMouseEvent;
      if (lastMouseEvent) {
        chart._eventHandler(lastMouseEvent);
      }
    }, 0);
  }
}

export default {
  id: 'streaming',

  version,

  beforeInit(chart) {
    const streaming = chart.$streaming = chart.$streaming || {render};
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
    chart.update = update;
  },

  beforeUpdate(chart) {
    const {scales, elements} = chart.options;
    const tooltip = chart.tooltip;

    each(scales, ({type}) => {
      if (type === 'realtime') {
        // Allow Bézier control to be outside the chart
        elements.line.capBezierPoints = false;
      }
    });

    if (tooltip) {
      tooltip.update = tooltipUpdate;
    }

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
  },

  beforeDatasetUpdate(chart, args) {
    const {meta, mode} = args;

    if (mode === 'quiet') {
      const {controller, $animations} = meta;

      // Skip updating element options if show/hide transition is active
      if ($animations && $animations.visible && $animations.visible._active) {
        controller.updateElement = noop;
        controller.updateSharedOptions = noop;
      }
    }
  },

  afterDatasetUpdate(chart, args) {
    const {meta, mode} = args;
    const {data: elements = [], dataset: element, controller} = meta;

    for (let i = 0, ilen = elements.length; i < ilen; ++i) {
      elements[i].$streaming = getAxisMap(elements[i], transitionKeys, meta);
    }
    if (element) {
      element.$streaming = getAxisMap(element, transitionKeys, meta);
    }

    if (mode === 'quiet') {
      delete controller.updateElement;
      delete controller.updateSharedOptions;
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
  },

  afterDatasetDraw(chart) {
    unclipArea(chart.ctx);
  },

  beforeEvent(chart, args) {
    const streaming = chart.$streaming;
    const event = args.event;

    if (event.type === 'mousemove') {
      // Save mousemove event for reuse
      streaming.lastMouseEvent = event;
    } else if (event.type === 'mouseout') {
      // Remove mousemove event
      delete streaming.lastMouseEvent;
    }
  },

  destroy(chart) {
    const {scales, $streaming: streaming, tooltip} = chart;
    const {canvas, mouseEventListener} = streaming;

    delete chart.update;
    if (tooltip) {
      delete tooltip.update;
    }

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
