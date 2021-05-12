import {registry} from 'chart.js';
import {isFinite} from 'chart.js/helpers';

function scaleValue(scale, value, fallback) {
  value = typeof value === 'number' ? value : scale.parse(value);
  return isFinite(value) ?
    {value: scale.getPixelForValue(value), transitionable: true} :
    {value: fallback};
}

function updateBoxAnnotation(element, chart, options) {
  const {scales, chartArea} = chart;
  const {xScaleID, yScaleID, xMin, xMax, yMin, yMax} = options;
  const xScale = scales[xScaleID];
  const yScale = scales[yScaleID];
  const {top, left, bottom, right} = chartArea;
  const streaming = element.$streaming = {};

  if (xScale) {
    const min = scaleValue(xScale, xMin, left);
    const max = scaleValue(xScale, xMax, right);
    const reverse = min.value > max.value;

    if (min.transitionable) {
      streaming[reverse ? 'x2' : 'x'] = {axisId: xScaleID};
    }
    if (max.transitionable) {
      streaming[reverse ? 'x' : 'x2'] = {axisId: xScaleID};
    }
    if (min.transitionable !== max.transitionable) {
      streaming.width = {axisId: xScaleID, reverse: min.transitionable};
    }
  }

  if (yScale) {
    const min = scaleValue(yScale, yMin, top);
    const max = scaleValue(yScale, yMax, bottom);
    const reverse = min.value > max.value;

    if (min.transitionable) {
      streaming[reverse ? 'y2' : 'y'] = {axisId: yScaleID};
    }
    if (max.transitionable) {
      streaming[reverse ? 'y' : 'y2'] = {axisId: yScaleID};
    }
    if (min.transitionable !== max.transitionable) {
      streaming.height = {axisId: yScaleID, reverse: min.transitionable};
    }
  }
}

function updateLineAnnotation(element, chart, options) {
  const {scales, chartArea} = chart;
  const {scaleID, value} = options;
  const scale = scales[scaleID];
  const {top, left, bottom, right} = chartArea;
  const streaming = element.$streaming = {};

  if (scale) {
    const isHorizontal = scale.isHorizontal();
    const pixel = scaleValue(scale, value);

    if (pixel.transitionable) {
      streaming[isHorizontal ? 'x' : 'y'] = {axisId: scaleID};
      streaming[isHorizontal ? 'x2' : 'y2'] = {axisId: scaleID};
    }
    return isHorizontal ? {top, bottom} : {left, right};
  }

  const {xScaleID, yScaleID, xMin, xMax, yMin, yMax} = options;
  const xScale = scales[xScaleID];
  const yScale = scales[yScaleID];
  const clip = {};

  if (xScale) {
    const min = scaleValue(xScale, xMin);
    const max = scaleValue(xScale, xMax);

    if (min.transitionable) {
      streaming.x = {axisId: xScaleID};
    } else {
      clip.left = left;
    }
    if (max.transitionable) {
      streaming.x2 = {axisId: xScaleID};
    } else {
      clip.right = right;
    }
  }

  if (yScale) {
    const min = scaleValue(yScale, yMin);
    const max = scaleValue(yScale, yMax);

    if (min.transitionable) {
      streaming.y = {axisId: yScaleID};
    } else {
      clip.top = top;
    }
    if (max.transitionable) {
      streaming.y2 = {axisId: yScaleID};
    } else {
      clip.bottom = bottom;
    }
  }

  return clip;
}

function updatePointAnnotation(element, chart, options) {
  const scales = chart.scales;
  const {xScaleID, yScaleID, xValue, yValue} = options;
  const xScale = scales[xScaleID];
  const yScale = scales[yScaleID];
  const streaming = element.$streaming = {};

  if (xScale) {
    const x = scaleValue(xScale, xValue);

    if (x.transitionable) {
      streaming.x = {axisId: xScaleID};
    }
  }

  if (yScale) {
    const y = scaleValue(yScale, yValue);

    if (y.transitionable) {
      streaming.y = {axisId: yScaleID};
    }
  }
}

function initAnnotationPlugin() {
  const BoxAnnotation = registry.getElement('boxAnnotation');
  const LineAnnotation = registry.getElement('lineAnnotation');
  const PointAnnotation = registry.getElement('pointAnnotation');
  const resolveBoxAnnotationProperties = BoxAnnotation.prototype.resolveElementProperties;
  const resolveLineAnnotationProperties = LineAnnotation.prototype.resolveElementProperties;
  const resolvePointAnnotationProperties = PointAnnotation.prototype.resolveElementProperties;

  BoxAnnotation.prototype.resolveElementProperties = function(chart, options) {
    updateBoxAnnotation(this, chart, options);
    return resolveBoxAnnotationProperties.call(this, chart, options);
  };

  LineAnnotation.prototype.resolveElementProperties = function(chart, options) {
    const chartArea = chart.chartArea;
    chart.chartArea = updateLineAnnotation(this, chart, options);
    const properties = resolveLineAnnotationProperties.call(this, chart, options);
    chart.chartArea = chartArea;
    return properties;
  };

  PointAnnotation.prototype.resolveElementProperties = function(chart, options) {
    updatePointAnnotation(this, chart, options);
    return resolvePointAnnotationProperties.call(this, chart, options);
  };
}

export function attachChart(plugin, chart) {
  const streaming = chart.$streaming;

  if (streaming.annotationPlugin !== plugin) {
    const afterUpdate = plugin.afterUpdate;

    initAnnotationPlugin();
    streaming.annotationPlugin = plugin;
    plugin.afterUpdate = (_chart, args, options) => {
      const mode = args.mode;
      const animationOpts = options.animation;

      if (mode === 'quiet') {
        options.animation = false;
      }
      afterUpdate.call(this, _chart, args, options);
      if (mode === 'quiet') {
        options.animation = animationOpts;
      }
    };
  }
}

export function getElements(chart) {
  const plugin = chart.$streaming.annotationPlugin;

  if (plugin) {
    const state = plugin._getState(chart);
    return state && state.elements || [];
  }
  return [];
}

export function detachChart(chart) {
  delete chart.$streaming.annotationPlugin;
}

