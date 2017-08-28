'use strict';

import Chart from 'chart.js';
import moment from 'moment';

import realTimeScale from './scales/scale.realtime';
import streamingPlugin from './plugins/plugin.streaming';

realTimeScale(Chart, moment);

// Workaround for Chart.js issue #4450. No need for 2.7.0 or later.
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

// Backported from Chart.js 5d57de4. No need for 2.7.0 or later.
Chart.controllers.bar.prototype.calculateBarValuePixels = function(datasetIndex, index) {
	var me = this;
	var chart = me.chart;
	var meta = me.getMeta();
	var scale = me.getValueScale();
	var datasets = chart.data.datasets;
	var value = scale.getRightValue(datasets[datasetIndex].data[index]);
	var stacked = scale.options.stacked;
	var stack = meta.stack;
	var start = 0;
	var i, imeta, ivalue, base, head, size;

	if (stacked || (stacked === undefined && stack !== undefined)) {
		for (i = 0; i < datasetIndex; ++i) {
			imeta = chart.getDatasetMeta(i);

			if (imeta.bar &&
				imeta.stack === stack &&
				imeta.controller.getValueScaleId() === scale.id &&
				chart.isDatasetVisible(i)) {

				ivalue = scale.getRightValue(datasets[i].data[index]);
				if ((value < 0 && ivalue < 0) || (value >= 0 && ivalue > 0)) {
					start += ivalue;
				}
			}
		}
	}

	base = scale.getPixelForValue(start);
	head = scale.getPixelForValue(start + value);
	size = (head - base) / 2;

	return {
		size: size,
		base: base,
		head: head,
		center: head + size / 2
	};
};

// Backported from Chart.js 5d57de4. No need for 2.7.0 or later.
Chart.controllers.bar.prototype.draw = function() {
	var me = this;
	var chart = me.chart;
	var scale = me.getValueScale();
	var rects = me.getMeta().data;
	var dataset = me.getDataset();
	var ilen = rects.length;
	var i = 0;

	Chart.helpers.canvas.clipArea(chart.ctx, chart.chartArea);

	for (; i < ilen; ++i) {
		if (!isNaN(scale.getRightValue(dataset.data[i]))) {
			rects[i].draw();
		}
	}

	Chart.helpers.canvas.unclipArea(chart.ctx);
};

var plugin = streamingPlugin(Chart);
Chart.plugins.register(plugin);
export default plugin;
