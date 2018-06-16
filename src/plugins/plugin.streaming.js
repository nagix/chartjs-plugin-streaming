'use strict';

export default function(Chart) {

	var helpers = Chart.helpers;

	Chart.defaults.global.plugins.streaming = {
		duration: 10000,
		refresh: 1000,
		delay: 0,
		frameRate: 30,
		pause: false,
		onRefresh: null
	};

	var realTimeScale = Chart.scaleService.getScaleConstructor('realtime');

	function generateMouseMoveEvent(chart) {
		// Dispach mouse event for scroll
		var event = chart.lastMouseMoveEvent;
		if (event) {
			if (typeof MouseEvent === 'function') {
				chart.canvas.dispatchEvent(event);
			} else {
				var newEvent = document.createEvent('MouseEvents');
				newEvent.initMouseEvent(
					event.type, event.bubbles, event.cancelable, event.view, event.detail,
					event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey,
					event.altKey, event.shiftKey, event.metaKey, event.button, event.relatedTarget
				);
				chart.canvas.dispatchEvent(newEvent);
			}
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

	function removeOldData(scale, lower, dataset, datasetIndex) {
		var data = dataset.data;
		var i, ilen;

		for (i = 2, ilen = data.length; i < ilen; ++i) {
			if (!(scale.getPixelForValue(null, i, datasetIndex) <= lower)) {
				break;
			}
		}
		// Keep the last two data points outside the range not to affect the existing bezier curve
		data.splice(0, i - 2);
		datasetPropertyKeys.forEach(function(key) {
			if (dataset.hasOwnProperty(key) && helpers.isArray(dataset[key])) {
				dataset[key].splice(0, i - 2);
			}
		});
		if (typeof data[0] !== 'object') {
			return i - 2;
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
					chart.render((animation.numSteps - animation.currentStep) * 16.66);
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
		var streamingOpts = chart.options.plugins.streaming;
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
					numToRemove = removeOldData(scale, scale.left, dataset, datasetIndex);
				}
			}
			if (meta.yAxisID) {
				scale = meta.controller.getScaleForId(meta.yAxisID);
				if (scale instanceof realTimeScale) {
					numToRemove = removeOldData(scale, scale.top, dataset, datasetIndex);
				}
			}
		});
		if (numToRemove) {
			chart.data.labels.splice(0, numToRemove);
		}

		updateChartData(chart);
	}

	function clearRefreshTimer(chart) {
		var refreshTimerID = chart.refreshTimerID;

		if (refreshTimerID) {
			clearInterval(refreshTimerID);
			delete chart.refreshTimerID;
			delete chart.refresh;
		}
	}

	function setRefreshTimer(chart, refresh) {
		chart.refreshTimerID = setInterval(function() {
			onRefresh(chart);
			if (chart.refresh !== chart.options.plugins.streaming.refresh) {
				clearRefreshTimer(chart);
				setRefreshTimer(chart, chart.options.plugins.streaming.refresh);
			}
		}, refresh);
		chart.refresh = refresh;
	}

	return {
		id: 'streaming',

		afterInit: function(chart, options) {
			setRefreshTimer(chart, options.refresh);
		},

		beforeUpdate: function(chart, options) {
			var chartOpts = chart.options;
			var scalesOpts = chartOpts.scales;
			var realtimeOpts;

			if (scalesOpts) {
				scalesOpts.xAxes.concat(scalesOpts.yAxes).forEach(function(scaleOpts) {
					if (scaleOpts.type === 'realtime' || scaleOpts.type === 'time') {
						realtimeOpts = scaleOpts.realtime;

						// For backwards compatibility
						if (!realtimeOpts) {
							realtimeOpts = scaleOpts.realtime = {};
						}

						// Copy plugin options to scale options
						realtimeOpts.duration = options.duration;
						realtimeOpts.refresh = options.refresh;
						realtimeOpts.delay = options.delay;
						realtimeOpts.frameRate = options.frameRate;
						realtimeOpts.pause = options.pause;
						realtimeOpts.onDraw = generateMouseMoveEvent;

						// Keep Bézier control inside the chart
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
			if (event.type === 'mousemove') {
				// Save mousemove event for reuse
				chart.lastMouseMoveEvent = event.native;
			} else if (event.type === 'mouseout') {
				// Remove mousemove event
				delete chart.lastMouseMoveEvent;
			}
			return true;
		},

		destroy: function(chart) {
			clearRefreshTimer(chart);
			helpers.each(chart.scales, function(scale) {
				if (scale instanceof realTimeScale) {
					scale.destroy();
				}
			});
		}
	};
}
