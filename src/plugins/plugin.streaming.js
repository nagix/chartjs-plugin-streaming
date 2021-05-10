'use strict';

import Chart from 'chart.js';
import streamingHelpers from '../helpers/helpers.streaming';
import AnnotationPlugin from '../plugins/plugin.annotation';
import ZoomPlugin from '../plugins/plugin.zoom';
import RealTimeScale from '../scales/scale.realtime';

var helpers = Chart.helpers;
var canvasHelpers = helpers.canvas;

Chart.defaults.global.plugins.streaming = {
	duration: 10000,
	delay: 0,
	frameRate: 30,
	refresh: 1000,
	onRefresh: null,
	pause: false,
	ttl: undefined
};

// Ported from Chart.js 2.9.4 d6a5ea0. Modified for realtime scale.
Chart.defaults.global.legend.onClick = function(e, legendItem) {
	var index = legendItem.datasetIndex;
	var ci = this.chart;
	var meta = ci.getDatasetMeta(index);

	meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
	ci.update({duration: 0});
};

function getAxisMap(element, keys, meta) {
	var axisMap = {};

	helpers.each(keys.x, function(key) {
		axisMap[key] = {axisId: meta.xAxisID};
	});
	helpers.each(keys.y, function(key) {
		axisMap[key] = {axisId: meta.yAxisID};
	});
	return axisMap;
}

var transitionKeys = {
	x: ['x', 'controlPointPreviousX', 'controlPointNextX', 'caretX'],
	y: ['y', 'controlPointPreviousY', 'controlPointNextY', 'caretY']
};

function updateElements(chart) {
	helpers.each(chart.data.datasets, function(dataset, datasetIndex) {
		var meta = chart.getDatasetMeta(datasetIndex);
		var elements = meta.data || [];
		var element = meta.dataset;
		var i, ilen;

		for (i = 0, ilen = elements.length; i < ilen; ++i) {
			elements[i]._streaming = getAxisMap(elements[i], transitionKeys, meta);
		}
		if (element) {
			element._streaming = getAxisMap(element, transitionKeys, meta);
		}
	});
}

/**
 * Update the chart keeping the current animation but suppressing a new one
 * @param {object} config - animation options
 */
function update(config) {
	var me = this;
	var preservation = config && config.preservation;
	var tooltip, lastActive, tooltipLastActive, lastMouseEvent, legend, legendUpdate;

	if (preservation) {
		tooltip = me.tooltip;
		lastActive = me.lastActive;
		tooltipLastActive = tooltip._lastActive;
		me._bufferedRender = true;
		legend = me.legend;

		// Skip legend update
		if (legend) {
			legendUpdate = legend.update;
			legend.update = helpers.noop;
		}
	}

	Chart.prototype.update.apply(me, arguments);

	if (preservation) {
		me._bufferedRender = false;
		me._bufferedRequest = null;
		me.lastActive = lastActive;
		tooltip._lastActive = tooltipLastActive;

		if (legend) {
			legend.update = legendUpdate;
		}

		if (me.animating) {
			// If the chart is animating, keep it until the duration is over
			Chart.animationService.animations.forEach(function(animation) {
				if (animation.chart === me) {
					me.render({
						duration: (animation.numSteps - animation.currentStep) * 16.66
					});
				}
			});
		} else {
			// If the chart is not animating, make sure that all elements are at the final positions
			me.data.datasets.forEach(function(dataset, datasetIndex) {
				me.getDatasetMeta(datasetIndex).controller.transition(1);
			});
		}

		if (tooltip._active) {
			tooltip.update(true);
		}

		lastMouseEvent = me.streaming.lastMouseEvent;
		if (lastMouseEvent) {
			me.eventHandler(lastMouseEvent);
		}
	}
}

function tooltipUpdate() {
	var me = this;
	var element = me._active && me._active[0];
	var meta;

	if (element) {
		meta = me._chart.getDatasetMeta(element._datasetIndex);
		me._streaming = getAxisMap(me, transitionKeys, meta);
	} else {
		me._streaming = {};
	}

	return Chart.Tooltip.prototype.update.apply(me, arguments);
}

// Draw chart at frameRate
function drawChart(chart) {
	var streaming = chart.streaming;
	var frameRate = chart.options.plugins.streaming.frameRate;
	var frameDuration = 1000 / (Math.max(frameRate, 0) || 30);
	var next = streaming.lastDrawn + frameDuration || 0;
	var now = Date.now();
	var lastMouseEvent = streaming.lastMouseEvent;

	if (next <= now) {
		// Draw only when animation is inactive
		if (!chart.animating && !chart.tooltip._start) {
			chart.draw();
		}
		if (lastMouseEvent) {
			chart.eventHandler(lastMouseEvent);
		}
		streaming.lastDrawn = (next + frameDuration > now) ? next : now;
	}
}

export default {
	id: 'streaming',

	beforeInit: function(chart) {
		var streaming = chart.streaming = chart.streaming || {};
		var canvas = streaming.canvas = chart.canvas;
		var mouseEventListener = streaming.mouseEventListener = function(event) {
			var pos = helpers.getRelativePosition(event, chart);
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

	afterInit: function(chart) {
		chart.update = update;
		chart.tooltip.update = tooltipUpdate;
	},

	beforeUpdate: function(chart) {
		var chartOpts = chart.options;
		var scalesOpts = chartOpts.scales;

		if (scalesOpts) {
			helpers.each(scalesOpts.xAxes.concat(scalesOpts.yAxes), function(scaleOpts) {
				if (scaleOpts.type === 'realtime' || scaleOpts.type === 'time') {
					// Allow Bézier control to be outside the chart
					chartOpts.elements.line.capBezierPoints = false;
				}
			});
		}

		if (chart.annotation) {
			AnnotationPlugin.attachChart(chart);
		} else {
			AnnotationPlugin.detachChart(chart);
		}

		if (chart.resetZoom) {
			ZoomPlugin.attachChart(chart);
		} else {
			ZoomPlugin.detachChart(chart);
		}

		return true;
	},

	afterUpdate: function(chart) {
		var streaming = chart.streaming;
		var pause = true;

		updateElements(chart);

		// if all scales are paused, stop refreshing frames
		helpers.each(chart.scales, function(scale) {
			if (scale instanceof RealTimeScale) {
				pause &= streamingHelpers.resolveOption(scale, 'pause');
			}
		});
		if (pause) {
			streamingHelpers.stopFrameRefreshTimer(streaming);
		} else {
			streamingHelpers.startFrameRefreshTimer(streaming, function() {
				drawChart(chart);
			});
		}
	},

	beforeDatasetDraw: function(chart, args) {
		var meta = args.meta;
		var chartArea = chart.chartArea;
		var clipArea = {
			left: 0,
			top: 0,
			right: chart.width,
			bottom: chart.height
		};
		if (meta.xAxisID && meta.controller.getScaleForId(meta.xAxisID) instanceof RealTimeScale) {
			clipArea.left = chartArea.left;
			clipArea.right = chartArea.right;
		}
		if (meta.yAxisID && meta.controller.getScaleForId(meta.yAxisID) instanceof RealTimeScale) {
			clipArea.top = chartArea.top;
			clipArea.bottom = chartArea.bottom;
		}
		canvasHelpers.clipArea(chart.ctx, clipArea);
		return true;
	},

	afterDatasetDraw: function(chart) {
		canvasHelpers.unclipArea(chart.ctx);
	},

	beforeEvent: function(chart, event) {
		var streaming = chart.streaming;

		if (event.type === 'mousemove') {
			// Save mousemove event for reuse
			streaming.lastMouseEvent = event;
		} else if (event.type === 'mouseout') {
			// Remove mousemove event
			delete streaming.lastMouseEvent;
		}
		return true;
	},

	destroy: function(chart) {
		var streaming = chart.streaming;
		var canvas = streaming.canvas;
		var mouseEventListener = streaming.mouseEventListener;

		streamingHelpers.stopFrameRefreshTimer(streaming);

		delete chart.update;
		delete chart.tooltip.update;

		canvas.removeEventListener('mousedown', mouseEventListener);
		canvas.removeEventListener('mouseup', mouseEventListener);

		helpers.each(chart.scales, function(scale) {
			if (scale instanceof RealTimeScale) {
				scale.destroy();
			}
		});
	}
};
