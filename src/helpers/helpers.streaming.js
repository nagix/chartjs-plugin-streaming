'use strict';

import Chart from 'chart.js';

var helpers = Chart.helpers;

var cancelAnimFrame = (function() {
	if (typeof window !== 'undefined') {
		return window.cancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.oCancelAnimationFrame ||
			window.msCancelAnimationFrame ||
			function(id) {
				return window.clearTimeout(id);
			};
	}
}());

export default {

	resolveOption(scale, key) {
		var realtimeOpts = scale.options.realtime;
		var streamingOpts = scale.chart.options.plugins.streaming;
		return helpers.valueOrDefault(realtimeOpts[key], streamingOpts[key]);
	},

	startFrameRefreshTimer: function(context, func) {
		if (!context.frameRequestID) {
			var frameRefresh = function() {
				func();
				context.frameRequestID = helpers.requestAnimFrame.call(window, frameRefresh);
			};
			context.frameRequestID = helpers.requestAnimFrame.call(window, frameRefresh);
		}
	},

	stopFrameRefreshTimer: function(context) {
		var frameRequestID = context.frameRequestID;

		if (frameRequestID) {
			cancelAnimFrame.call(window, frameRequestID);
			delete context.frameRequestID;
		}
	}

};
