'use strict';

import Chart from 'chart.js';
import helpers from '../core/core.helpers';
import RealTimeScale from '../scales/scale.realtime';

Chart.defaults.global.plugins.streaming = {
	duration: 10000,
	delay: 0,
	frameRate: 30,
	refresh: 1000,
	onRefresh: null,
	pause: false,
	ttl: undefined
};

// Dispach mouse event for scroll
function generateMouseMoveEvent(chart) {
	var event = chart.streaming.lastMouseEvent;
	var newEvent;

	if (event) {
		if (typeof MouseEvent === 'function') {
			newEvent = new MouseEvent('mousemove', event);
		} else {
			newEvent = document.createEvent('MouseEvents');
			newEvent.initMouseEvent(
				'mousemove', event.bubbles, event.cancelable, event.view, event.detail,
				event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey,
				event.altKey, event.shiftKey, event.metaKey, event.button, event.relatedTarget
			);
		}
		chart.canvas.dispatchEvent(newEvent);
	}
}

/**
 * Update the chart data keeping the current animation but suppressing a new one
 * @param chart {Chart} chart to update
 */
function updateChartData(chart) {
	var animationOpts = chart.options.animation;
	var datasets = chart.data.datasets;
	var newControllers = chart.buildOrUpdateControllers();

	datasets.forEach(function(dataset, datasetIndex) {
		chart.getDatasetMeta(datasetIndex).controller.buildOrUpdateElements();
	});
	chart.updateLayout();
	if (animationOpts && animationOpts.duration) {
		helpers.each(newControllers, function(controller) {
			controller.reset();
		});
	}
	chart.updateDatasets();

	if (chart.animating) {
		// If the chart is animating, keep it until the duration is over
		Chart.animationService.animations.forEach(function(animation) {
			if (animation.chart === chart) {
				chart.render({
					duration: (animation.numSteps - animation.currentStep) * 16.66
				});
			}
		});
	} else {
		// If the chart is not animating, make sure that all elements are at the final positions
		datasets.forEach(function(dataset, datasetIndex) {
			chart.getDatasetMeta(datasetIndex).controller.transition(1);
		});
	}

	if (chart.tooltip._active) {
		chart.tooltip.update(true);
	}

	generateMouseMoveEvent(chart);
}

var update = Chart.prototype.update;

Chart.prototype.update = function(config) {
	if (config && config.preservation) {
		updateChartData(this);
	} else {
		update.apply(this, arguments);
	}
};

// Draw chart at frameRate
function drawChart(chart) {
	var streaming = chart.streaming;
	var frameRate = chart.options.plugins.streaming.frameRate;
	var frameDuration = 1000 / (Math.max(frameRate, 0) || 30);
	var next = streaming.lastDrawn + frameDuration || 0;
	var now = Date.now();

	if (next <= now) {
		// Draw only when animation is inactive
		if (!chart.animating && !chart.tooltip._start) {
			chart.draw();
		}
		generateMouseMoveEvent(chart);
		streaming.lastDrawn = (next + frameDuration > now) ? next : now;
	}
}

export default {
	id: 'streaming',

	beforeInit: function(chart) {
		var streaming = chart.streaming = chart.streaming || {};
		var canvas = streaming.canvas = chart.canvas;
		var mouseEventListener = streaming.mouseEventListener = function(event) {
			streaming.lastMouseEvent = event;
		};

		canvas.addEventListener('mousedown', mouseEventListener);
		canvas.addEventListener('mouseup', mouseEventListener);
	},

	afterInit: function(chart) {
		if (chart.resetZoom) {
			Chart.Zoom.updateResetZoom(chart);
		}
	},

	beforeUpdate: function(chart) {
		var chartOpts = chart.options;
		var scalesOpts = chartOpts.scales;

		if (scalesOpts) {
			scalesOpts.xAxes.concat(scalesOpts.yAxes).forEach(function(scaleOpts) {
				if (scaleOpts.type === 'realtime' || scaleOpts.type === 'time') {
					// Allow Bézier control to be outside the chart
					chartOpts.elements.line.capBezierPoints = false;
				}
			});
		}
		return true;
	},

	afterUpdate: function(chart, options) {
		var streaming = chart.streaming;
		var pause = true;

		// if all scales are paused, stop refreshing frames
		helpers.each(chart.scales, function(scale) {
			if (scale instanceof RealTimeScale) {
				pause &= helpers.valueOrDefault(scale.options.realtime.pause, options.pause);
			}
		});
		if (pause) {
			helpers.stopFrameRefreshTimer(streaming);
		} else {
			helpers.startFrameRefreshTimer(streaming, function() {
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
		helpers.canvas.clipArea(chart.ctx, clipArea);
		return true;
	},

	afterDatasetDraw: function(chart) {
		helpers.canvas.unclipArea(chart.ctx);
	},

	beforeEvent: function(chart, event) {
		var streaming = chart.streaming;

		if (event.type === 'mousemove') {
			// Save mousemove event for reuse
			streaming.lastMouseEvent = event.native;
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

		helpers.stopFrameRefreshTimer(streaming);

		canvas.removeEventListener('mousedown', mouseEventListener);
		canvas.removeEventListener('mouseup', mouseEventListener);

		helpers.each(chart.scales, function(scale) {
			if (scale instanceof RealTimeScale) {
				scale.destroy();
			}
		});
	}
};
