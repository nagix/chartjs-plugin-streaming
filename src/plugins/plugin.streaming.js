'use strict';

export default function(Chart) {

	var helpers = Chart.helpers;

	Chart.defaults.global.plugins.streaming = {
		duration: 10000,
		delay: 0,
		frameRate: 30,
		refresh: 1000,
		onRefresh: null,
		pause: false,
		ttl: undefined
	};

	var realTimeScale = Chart.scaleService.getScaleConstructor('realtime');

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

	var datasetPropertyKeys = [
		'pointBackgroundColor',
		'pointBorderColor',
		'pointBorderWidth',
		'pointRadius',
		'pointStyle',
		'pointHitRadius',
		'pointHoverBackgroundColor',
		'pointHoverBorderColor',
		'pointHoverBorderWidth',
		'pointHoverRadius',
		'backgroundColor',
		'borderColor',
		'borderWidth',
		'hoverBackgroundColor',
		'hoverBorderColor',
		'hoverBorderWidth',
		'hoverRadius',
		'hitRadius',
		'radius'
	];

	function removeOldData(scale, lower, ttl, dataset, datasetIndex) {
		var data = dataset.data;
		var backlog = 2;
		var i, ilen;

		if (!isNaN(ttl)) {
			lower = scale.getPixelForValue(Date.now() - ttl);
			backlog = 0;
		}

		for (i = backlog, ilen = data.length; i < ilen; ++i) {
			if (!(scale.getPixelForValue(null, i, datasetIndex) <= lower)) {
				break;
			}
		}
		// Keep the last two data points outside the range not to affect the existing bezier curve
		data.splice(0, i - backlog);
		datasetPropertyKeys.forEach(function(key) {
			if (dataset.hasOwnProperty(key) && helpers.isArray(dataset[key])) {
				dataset[key].splice(0, i - backlog);
			}
		});
		if (typeof data[0] !== 'object') {
			return i - backlog;
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

	function onRefresh(chart) {
		var streamingOpts = chart.options.plugins.streaming || {};
		var ttl = streamingOpts.ttl;
		var meta, scale, numToRemove;

		if (streamingOpts.onRefresh) {
			streamingOpts.onRefresh(chart);
		}

		// Remove old data
		chart.data.datasets.forEach(function(dataset, datasetIndex) {
			meta = chart.getDatasetMeta(datasetIndex);
			if (meta.xAxisID) {
				scale = meta.controller.getScaleForId(meta.xAxisID);
				if (scale instanceof realTimeScale) {
					numToRemove = removeOldData(scale, scale.left, ttl, dataset, datasetIndex);
				}
			}
			if (meta.yAxisID) {
				scale = meta.controller.getScaleForId(meta.yAxisID);
				if (scale instanceof realTimeScale) {
					numToRemove = removeOldData(scale, scale.top, ttl, dataset, datasetIndex);
				}
			}
		});
		if (numToRemove) {
			chart.data.labels.splice(0, numToRemove);
		}

		updateChartData(chart);
	}

	function clearRefreshTimer(chart) {
		var streaming = chart.streaming;
		var refreshTimerID = streaming.refreshTimerID;

		if (refreshTimerID) {
			clearInterval(refreshTimerID);
			delete streaming.refreshTimerID;
			delete streaming.refresh;
		}
	}

	function setRefreshTimer(chart, refresh) {
		var streaming = chart.streaming;

		streaming.refreshTimerID = setInterval(function() {
			var streamingOpts = chart.options.plugins.streaming || {};
			var newRefresh = streamingOpts.refresh;

			onRefresh(chart);
			if (streaming.refresh !== newRefresh && !isNaN(newRefresh)) {
				clearRefreshTimer(chart);
				setRefreshTimer(chart, newRefresh);
			}
		}, refresh);
		streaming.refresh = refresh;
	}

	return {
		id: 'streaming',

		beforeInit: function(chart) {
			var streaming = chart.streaming = chart.streaming || {};
			var canvas = streaming.canvas = chart.canvas;
			var mouseEventListener = streaming.mouseEventListener = function(event) {
				streaming.lastMouseEvent = event;
			};

			canvas.addEventListener('mousedown', mouseEventListener);
			canvas.addEventListener('mouseup', mouseEventListener);
			streaming.onDraw = generateMouseMoveEvent;
		},

		afterInit: function(chart, options) {
			setRefreshTimer(chart, options.refresh);
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

		beforeDatasetDraw: function(chart, args) {
			var meta = args.meta;
			var chartArea = chart.chartArea;
			var clipArea = {
				left: 0,
				top: 0,
				right: chart.width,
				bottom: chart.height
			};
			if (meta.xAxisID && meta.controller.getScaleForId(meta.xAxisID) instanceof realTimeScale) {
				clipArea.left = chartArea.left;
				clipArea.right = chartArea.right;
			}
			if (meta.yAxisID && meta.controller.getScaleForId(meta.yAxisID) instanceof realTimeScale) {
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

			canvas.removeEventListener('mousedown', mouseEventListener);
			canvas.removeEventListener('mouseup', mouseEventListener);

			clearRefreshTimer(chart);
			helpers.each(chart.scales, function(scale) {
				if (scale instanceof realTimeScale) {
					scale.destroy();
				}
			});
		}
	};
}
