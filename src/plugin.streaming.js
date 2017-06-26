'use strict';

import moment from 'moment';
import Chart from 'chart.js';

var helpers = Chart.helpers;
var plugins = Chart.plugins;

Chart.defaults.global.plugins.streaming = {
	duration: 10000,
	refresh: 1000,
	delay: 0,
	onRefresh: null
};

// Backported from Chart.js 2d7c1f0. No need for 2.7.0 or later.
var interval = {
	millisecond: {
		size: 1,
		steps: [1, 2, 5, 10, 20, 50, 100, 250, 500]
	},
	second: {
		size: 1000,
		steps: [1, 2, 5, 10, 30]
	},
	minute: {
		size: 60000,
		steps: [1, 2, 5, 10, 30]
	},
	hour: {
		size: 3600000,
		steps: [1, 2, 3, 6, 12]
	},
	day: {
		size: 86400000,
		steps: [1, 2, 5]
	},
	week: {
		size: 604800000,
		maxStep: 4
	},
	month: {
		size: 2.628e9,
		maxStep: 3
	},
	quarter: {
		size: 7.884e9,
		maxStep: 4
	},
	year: {
		size: 3.154e10,
		maxStep: false
	}
};

// Backported from Chart.js 2d7c1f0. No need for 2.7.0 or later.
function determineMajorUnit(unit) {
	var units = Object.keys(interval);
	var unitIndex = units.indexOf(unit);
	while (unitIndex < units.length) {
		var majorUnit = units[++unitIndex];
		// exclude 'week' and 'quarter' units
		if (majorUnit !== 'week' && majorUnit !== 'quarter') {
			return majorUnit;
		}
	}

	return null;
}

// Backported from Chart.js 2d7c1f0. No need for 2.7.0 or later.
function determineMajorUnitStart(startTick, majorUnit) {
	return majorUnit ? moment(startTick).add(1, majorUnit).startOf(majorUnit) : startTick;
}

// Backported from Chart.js 2d7c1f0. No need for 2.7.0 or later.
function generateTicks(options, dataRange, niceRange) {
	var ticks = [];
	if (options.maxTicks) {
		var stepSize = options.stepSize;
		var startTick = options.min !== undefined ? options.min : niceRange.min;
		var majorUnit = determineMajorUnit(options.unit);
		var majorUnitStart = determineMajorUnitStart(startTick, majorUnit);
		var startRange = majorUnitStart.valueOf() - startTick;
		var stepValue = interval[options.unit].size * stepSize;
		var startFraction = startRange % stepValue;
		var alignedTick = startTick;
		if (startFraction && majorUnit && !options.isoWeekday) {
			alignedTick += startFraction - stepValue;
			ticks.push(alignedTick);
		} else {
			ticks.push(startTick);
		}
		var cur = moment(alignedTick);
		var realMax = options.max || niceRange.max;
		while (cur.add(stepSize, options.unit).valueOf() < realMax) {
			ticks.push(cur.valueOf());
		}
		ticks.push(cur.valueOf());
	}
	return ticks;
}

// Backported from Chart.js 2d7c1f0. No need for 2.7.0 or later.
Chart.Ticks.generators.time = function(options, dataRange) {
	var niceMin;
	var niceMax;
	var isoWeekday = options.isoWeekday;
	if (options.unit === 'week' && isoWeekday !== false) {
		niceMin = moment(dataRange.min).startOf('isoWeek').isoWeekday(isoWeekday).valueOf();
		niceMax = moment(dataRange.max).startOf('isoWeek').isoWeekday(isoWeekday);
		if (dataRange.max - niceMax > 0) {
			niceMax.add(1, 'week');
		}
		niceMax = niceMax.valueOf();
	} else {
		niceMin = moment(dataRange.min).startOf(options.unit).valueOf();
		niceMax = moment(dataRange.max).startOf(options.unit);
		if (dataRange.max - niceMax > 0) {
			niceMax.add(1, options.unit);
		}
		niceMax = niceMax.valueOf();
	}
	return generateTicks(options, dataRange, {
		min: niceMin,
		max: niceMax
	});
};

var TimeScale = Chart.scaleService.getScaleConstructor('time');

TimeScale.prototype.getPixelForOffset = function(offset) {
	var me = this;
	var options = me.chart.options.plugins.streaming;
	var epochWidth = me.max - me.min;
	var decimal = epochWidth ? (offset - me.min) / epochWidth : 0;

	if (me.isHorizontal()) {
		return me.left + (options ? (me.width * decimal) : Math.round(me.width * decimal));
	}

	return me.top + (options ? (me.height * decimal) : Math.round(me.height * decimal));
};

Chart.prototype.draw = function(easingValue) {
	var me = this;

	me.clear();

	if (easingValue === undefined || easingValue === null) {
		easingValue = 1;
	}

	me.transition(easingValue);

	if (plugins.notify(me, 'beforeDraw', [easingValue]) === false) {
		return;
	}

	// Draw all the scales
	me.drawBoxes();

	me.drawDatasets(easingValue);

	// Finally draw the tooltip
	me.tooltip.draw();

	plugins.notify(me, 'afterDraw', [easingValue]);
};

Chart.prototype.drawBoxes = function() {
	var me = this;
	var chartArea = me.chartArea;

	helpers.each(me.boxes, function(box) {
		if (plugins.notify(me, 'beforeBoxDraw', [box, chartArea]) === true) {
			box.draw(me.chartArea);
			plugins.notify(me, 'afterBoxDraw', [box, chartArea]);
		}
	});

	if (me.scale) {
		if (plugins.notify(me, 'beforeBoxDraw', [me.scale, chartArea]) === true) {
			me.scale.draw();
			plugins.notify(me, 'afterBoxDraw', [me.scale, chartArea]);
		}
	}
};

function extendedArea(chart, points) {
	var pointLen = points.length;
	if (!chart.options.plugins.streaming || pointLen === 0) {
		return chart.chartArea;
	}

	// Returns the extended chart area includes the last point
	var area = helpers.clone(chart.chartArea);
	var model = points[pointLen - 1]._model;
	if (chart.horizontalScroll) {
		area.right = model.x;
	}
	if (chart.verticalScroll) {
		area.bottom = model.y;
	}
	return area;
}

Chart.controllers.line.prototype.draw = function() {
	var me = this;
	var chart = me.chart;
	var options = chart.options.plugins.streaming;
	var meta = me.getMeta();
	var points = meta.data || [];
	var area = extendedArea(chart, points);
	var ilen = points.length;
	var i = 0;

	// Clip if streaming is disabled
	if (!options) {
		Chart.canvasHelpers.clipArea(chart.ctx, chart.chartArea);
	}

	// Draw the line
	if (helpers.getValueOrDefault(me.getDataset().showLine, chart.options.showLines)) {
		meta.dataset.draw();
	}

	// Unclip if streaming is disabled
	if (!options) {
		Chart.canvasHelpers.unclipArea(chart.ctx);
	}

	// Draw the points
	for (; i<ilen; ++i) {
		points[i].draw(area);
	}
};

function removeOldData(datasets, field, min) {
	datasets.forEach(function(dataset) {
		var data = dataset.data;
		var howMany = 0;
		for (; howMany < data.length; ++howMany) {
			if (moment(field(data[howMany])).isSameOrAfter(min)) {
				break;
			}
		}
		data.splice(0, howMany);
	});
}

function beforeBuildTicks(scale) {
	var options = scale.chart.options.plugins.streaming;
	if (!options || scale.options.type !== 'time') {
		return;
	}

	// Add refresh interval to add extra ticks for scroll
	scale.options.time.max += options.refresh;
}

function afterBuildTicks(scale) {
	var options = scale.chart.options.plugins.streaming;
	if (!options || scale.options.type !== 'time') {
		return;
	}

	var timeOpts = scale.options.time;

	// Restore max value
	timeOpts.max -= options.refresh;

	// Reset max and min even if the range of ticks has been expanded
	scale.min = timeOpts.min;
	scale.max = timeOpts.max;
}

function startTranslate(chart, options) {
	var context = chart.chart.ctx;
	var clipArea = helpers.clone(chart.chartArea);
	var translateX = 0;
	var translateY = 0;
	var offsetFactor = (Date.now() - chart.lastUpdate) / options.duration;

	// Save context and clip chart & time scale area
	if (chart.horizontalScroll) {
		clipArea.top = 0;
		clipArea.bottom = chart.height;
		translateX = -(clipArea.right - clipArea.left) * offsetFactor;
	}
	if (chart.verticalScroll) {
		clipArea.left = 0;
		clipArea.right = chart.width;
		translateY = -(clipArea.bottom - clipArea.top) * offsetFactor;
	}
	Chart.canvasHelpers.clipArea(context, clipArea);

	// Translate for scroll
	context.translate(translateX, translateY);
}

function endTranslate(chart) {
	// Unclip and restore context
	Chart.canvasHelpers.unclipArea(chart.ctx);
}

function drawBorder(scale) {
	var options = scale.options;
	if (!options.display) {
		return;
	}

	var context = scale.ctx;
	var gridLines = options.gridLines;

	// Extend grid border to the last tick
	if (gridLines.drawBorder) {
		context.lineWidth = helpers.getValueAtIndexOrDefault(gridLines.lineWidth, 0);
		context.strokeStyle = helpers.getValueAtIndexOrDefault(gridLines.color, 0);

		var x1 = scale.right;
		var x2 = scale.getPixelForTick(scale.ticks.length - 1);
		var y1 = scale.bottom;
		var y2 = scale.getPixelForTick(scale.ticks.length - 1);

		var aliasPixel = helpers.aliasPixel(context.lineWidth);
		if (scale.isHorizontal()) {
			y1 = y2 = options.position === 'top' ? scale.bottom : scale.top;
			y1 += aliasPixel;
			y2 += aliasPixel;
		} else {
			x1 = x2 = options.position === 'left' ? scale.right : scale.left;
			x1 += aliasPixel;
			x2 += aliasPixel;
		}

		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
	}
}

var streamingPlugin = {
	id: 'streaming',

	afterInit: function(chart, options) {
		var scales = chart.options.scales;
		var xAxis = scales.xAxes[0];
		var yAxis = scales.yAxes[0];

		xAxis.beforeBuildTicks = yAxis.beforeBuildTicks = beforeBuildTicks;
		xAxis.afterBuildTicks = yAxis.afterBuildTicks = afterBuildTicks;

		var nextRefresh = Date.now() + options.refresh;
		var scroll = function() {
			var now = Date.now();
			if (now >= nextRefresh) {
				nextRefresh = now + options.refresh + (now - nextRefresh) % options.refresh;
				if (options.onRefresh) {
					options.onRefresh(chart);
				}
				chart.update();
			}

			if (chart.horizontalScroll || chart.verticalScroll) {
				chart.draw();
			}

			helpers.requestAnimFrame.call(window, scroll);
		};
		helpers.requestAnimFrame.call(window, scroll);
	},

	beforeUpdate: function(chart, options) {
		var chartOpts = chart.options;
		var scales = chartOpts.scales;
		var xAxis = scales.xAxes[0];
		var yAxis = scales.yAxes[0];
		var datasets = chart.data.datasets;

		xAxis.ticks.maxRotation = false;
		chartOpts.elements.line.capBezierPoints = false;
		chartOpts.animation.duration = 0;

		chart.horizontalScroll = xAxis.type === 'time';
		chart.verticalScroll = yAxis.type === 'time';

		// Update the range of the time scales based on duration and delay
		var max = moment().subtract(options.delay, 'ms');
		var min = max.clone().subtract(options.duration, 'ms');
		var dataMin = min.clone().subtract(options.refresh*2, 'ms');
		if (chart.horizontalScroll) {
			xAxis.time.min = min;
			xAxis.time.max = max;
			removeOldData(datasets, function(d) {
				return d.x;
			}, dataMin);
		}
		if (chart.verticalScroll) {
			yAxis.time.min = min;
			yAxis.time.max = max;
			removeOldData(datasets, function(d) {
				return d.y;
			}, dataMin);
		}

		chart.lastUpdate = Date.now();
	},

	afterRender: function(chart) {
		var tooltip = chart.tooltip;

		// Trigger tooltip update for scroll
		tooltip._active = tooltip._active || [];
		tooltip.update(true);
	},

	beforeDraw: function(chart, easingValue, options) {
		// Enable translate for scroll
		startTranslate(chart, options);
		return true;
	},

	afterDraw: function(chart) {
		// Disable tlanstale
		endTranslate(chart);

		// Dispach mouse event for scroll
		var event = chart.lastMouseMoveEvent;
		if (event) {
			chart.canvas.dispatchEvent(event.native);
		}
	},

	beforeBoxDraw: function(chart, box) {
		// Disable translate if the box is not a time scale
		if (box.options.type !== 'time') {
			endTranslate(chart);
		}
		return true;
	},

	afterBoxDraw: function(chart, box, chartArea, options) {
		if (box.options.type !== 'time') {
			// Enable translate for scroll again
			startTranslate(chart, options);
		} else {
			// Draw grid border for scroll
			drawBorder(box);
		}
	},

	beforeEvent: function(chart, event, options) {
		if (event.type === 'mousemove') {
			// Save mousemove event for reuse
			chart.lastMouseMoveEvent = event;

			// Update mouse position to compensate scroll
			var chartArea = chart.chartArea;
			if (event.x >= chartArea.left && event.x < chartArea.right && event.y >= chartArea.top && event.y < chartArea.bottom) {
				var offsetFactor = (Date.now() - chart.lastUpdate) / options.duration;
				if (chart.horizontalScroll) {
					event.x += (chartArea.right - chartArea.left) * offsetFactor;
				}
				if (chart.verticalScroll) {
					event.y += (chartArea.bottom - chartArea.top) * offsetFactor;
				}
			}
		} else if (event.type === 'mouseout') {
			delete chart.lastMouseMoveEvent;
		}
		return true;
	}
};

plugins.register(streamingPlugin);
export default streamingPlugin;
