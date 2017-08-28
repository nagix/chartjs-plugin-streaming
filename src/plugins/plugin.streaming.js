'use strict';

export default function(Chart) {

	Chart.defaults.global.plugins.streaming = {
		duration: 10000,
		refresh: 1000,
		delay: 0,
		onRefresh: null
	};

	function onRefresh(scale) {
		var me = this;
		var streamingOpts = me.options.plugins.streaming;
		var start = scale.isHorizontal() ? scale.left : scale.top;
		var data, i, ilen, howMany;

		if (streamingOpts.onRefresh) {
			streamingOpts.onRefresh(me);
		}

		// Remove old data
		me.data.datasets.forEach(function(dataset, datasetIndex) {
			data = dataset.data;
			for (i = 2, ilen = data.length; i < ilen; ++i) {
				if (!(scale.getPixelForValue(null, i, datasetIndex) <= start)) {
					break;
				}
			}
			// Keep the last two data points outside the range not to affect the existing bezier curve
			data.splice(0, i - 2);
			if (typeof data[0] !== 'object') {
				howMany = i - 2;
			}
		});
		if (howMany) {
			me.data.labels.splice(0, howMany);
		}
	}

	return {
		id: 'streaming',

		beforeUpdate: function(chart, options) {
			var chartOpts = chart.options;
			var scalesOpts = chartOpts.scales;

			chartOpts.elements.line.capBezierPoints = false;
			scalesOpts.xAxes.forEach(function(scaleOpts) {
				scaleOpts.ticks.maxRotation = false;
			});

			scalesOpts.xAxes.concat(scalesOpts.yAxes).forEach(function(scaleOpts) {
				if (scaleOpts.type === 'realtime' || scaleOpts.type === 'time') {
					var realtimeOpts = scaleOpts.realtime;

					// For backwards compatibility
					if (!realtimeOpts) {
						realtimeOpts = scaleOpts.realtime = {};
					}

					// Copy plugin options to scale options
					realtimeOpts.duration = options.duration;
					realtimeOpts.refresh = options.refresh;
					realtimeOpts.delay = options.delay;
					realtimeOpts.onRefresh = onRefresh;
				}
			});
		},

		beforeDraw: function(chart) {
			// Dispach mouse event for scroll
			var event = chart.lastMouseMoveEvent;
			if (event) {
				chart.canvas.dispatchEvent(event.native);
			}
			return true;
		},

		beforeEvent: function(chart, event) {
			if (event.type === 'mousemove') {
				// Save mousemove event for reuse
				chart.lastMouseMoveEvent = event;
			} else if (event.type === 'mouseout') {
				// Remove mousemove event
				delete chart.lastMouseMoveEvent;
			}
			return true;
		}
	};
}
