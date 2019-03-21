'use strict';

import Chart from 'chart.js';

var helpers = Chart.helpers;

// Ported from chartjs-plugin-zoom 0.7.0 3c187b7
var zoomNS = Chart.Zoom = Chart.Zoom || {};

// Ported from chartjs-plugin-zoom 0.7.0 3c187b7
zoomNS.zoomFunctions = zoomNS.zoomFunctions || {};
zoomNS.panFunctions = zoomNS.panFunctions || {};

// Ported from chartjs-plugin-zoom 0.7.0 3c187b7
function rangeMaxLimiter(zoomPanOptions, newMax) {
	if (zoomPanOptions.scaleAxes && zoomPanOptions.rangeMax &&
			!helpers.isNullOrUndef(zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes])) {
		var rangeMax = zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes];
		if (newMax > rangeMax) {
			newMax = rangeMax;
		}
	}
	return newMax;
}

// Ported from chartjs-plugin-zoom 0.7.0 3c187b7
function rangeMinLimiter(zoomPanOptions, newMin) {
	if (zoomPanOptions.scaleAxes && zoomPanOptions.rangeMin &&
			!helpers.isNullOrUndef(zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes])) {
		var rangeMin = zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes];
		if (newMin < rangeMin) {
			newMin = rangeMin;
		}
	}
	return newMin;
}

function zoomRealTimeScale(scale, zoom, center, zoomOptions) {
	var realtimeOpts = scale.options.realtime;
	var streamingOpts = scale.chart.options.plugins.streaming;
	var duration = helpers.valueOrDefault(realtimeOpts.duration, streamingOpts.duration);
	var delay = helpers.valueOrDefault(realtimeOpts.delay, streamingOpts.delay);
	var newDuration = duration * (2 - zoom);
	var maxPercent, limitedDuration;

	if (scale.isHorizontal()) {
		maxPercent = (scale.right - center.x) / (scale.right - scale.left);
	} else {
		maxPercent = (scale.bottom - center.y) / (scale.bottom - scale.top);
	}
	if (zoom < 1) {
		limitedDuration = rangeMaxLimiter(zoomOptions, newDuration);
	} else {
		limitedDuration = rangeMinLimiter(zoomOptions, newDuration);
	}
	realtimeOpts.duration = limitedDuration;
	realtimeOpts.delay = delay + maxPercent * (duration - limitedDuration);
}

function panRealTimeScale(scale, delta, panOptions) {
	var realtimeOpts = scale.options.realtime;
	var streamingOpts = scale.chart.options.plugins.streaming;
	var delay = helpers.valueOrDefault(realtimeOpts.delay, streamingOpts.delay);
	var newDelay = delay + (scale.getValueForPixel(delta) - scale.getValueForPixel(0));

	if (delta > 0) {
		realtimeOpts.delay = rangeMaxLimiter(panOptions, newDelay);
	} else {
		realtimeOpts.delay = rangeMinLimiter(panOptions, newDelay);
	}
}

zoomNS.zoomFunctions.realtime = zoomRealTimeScale;
zoomNS.panFunctions.realtime = panRealTimeScale;

function updateResetZoom(chart) {
	// For chartjs-plugin-zoom 0.6.6 backward compatibility
	var zoom = chart.$zoom || {_originalOptions: {}};

	var resetZoom = chart.resetZoom;
	var update = chart.update;
	var resetZoomAndUpdate = function() {
		helpers.each(chart.scales, function(scale) {
			var realtimeOptions = scale.options.realtime;
			var originalOptions = zoom._originalOptions[scale.id] || scale.originalOptions;

			if (realtimeOptions) {
				if (originalOptions) {
					realtimeOptions.duration = originalOptions.realtime.duration;
					realtimeOptions.delay = originalOptions.realtime.delay;
				} else {
					delete realtimeOptions.duration;
					delete realtimeOptions.delay;
				}
			}
		});

		update.call(chart, {
			duration: 0
		});
	};

	chart.resetZoom = function() {
		chart.update = resetZoomAndUpdate;
		resetZoom();
		chart.update = update;
	};
}

zoomNS.updateResetZoom = updateResetZoom;

export {
	zoomRealTimeScale,
	panRealTimeScale,
	updateResetZoom
};
