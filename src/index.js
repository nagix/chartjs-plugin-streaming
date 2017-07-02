'use strict';

import Chart from 'chart.js';
import moment from 'moment';

import realTimeScale from './scales/scale.realtime';
import streamingPlugin from './plugins/plugin.streaming';

realTimeScale(Chart, moment);

// Workaround for Chart.js issue #4450
Chart.plugins.getAll().forEach(function(plugin) {
	if (plugin.id === 'filler') {
		var beforeDatasetDraw = plugin.beforeDatasetDraw;
		plugin.beforeDatasetDraw = function(chart, args) {
			Chart.helpers.canvas.clipArea(chart.ctx, chart.chartArea);
			beforeDatasetDraw(chart, args);
			Chart.helpers.canvas.unclipArea(chart.ctx);
		};
	}
});

var plugin = streamingPlugin(Chart, moment);
Chart.plugins.register(plugin);
export default plugin;
