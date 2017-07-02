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

var realTimeScaleDefaultConfig = {
	position: 'bottom',

	time: {
		parser: false, // false == a pattern string from http://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
		format: false, // DEPRECATED false == date objects, moment object, callback or a pattern string from http://momentjs.com/docs/#/parsing/string-format/
		unit: false, // false == automatic or override with week, month, year, etc.
		round: false, // none, or override with week, month, year, etc.
		displayFormat: false, // DEPRECATED
		isoWeekday: false, // override week start day - see http://momentjs.com/docs/#/get-set/iso-weekday/
		minUnit: 'millisecond',

		// defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
		displayFormats: {
			millisecond: 'h:mm:ss.SSS a', // 11:20:01.123 AM,
			second: 'h:mm:ss a', // 11:20:01 AM
			minute: 'h:mm a', // 11:20 AM
			hour: 'hA', // 5PM
			day: 'MMM D', // Sep 4
			week: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
			month: 'MMM YYYY', // Sept 2015
			quarter: '[Q]Q - YYYY', // Q3
			year: 'YYYY' // 2015
		},
	},
	realtime: {
		duration: 10000,
		refresh: 1000,
		delay: 0,
		onRefresh: null
	},
	ticks: {
		autoSkip: false
	}
};

// Backported from Chart.js 225bfd3. No need for 2.7.0 or later.
function isObject(value) {
	return value !== null && Object.prototype.toString.call(value) === '[object Object]';
}

// Backported from Chart.js 225bfd3. No need for 2.7.0 or later.
function valueOrDefault(value, defaultValue) {
	return typeof value === 'undefined'? defaultValue : value;
}

// Backported from Chart.js 225bfd3. No need for 2.7.0 or later.
function clone(source) {
	if (helpers.isArray(source)) {
		return source.map(clone);
	}

	if (isObject(source)) {
		var target = {};
		var keys = Object.keys(source);
		var klen = keys.length;
		var k = 0;

		for (; k<klen; ++k) {
			target[keys[k]] = clone(source[keys[k]]);
		}

		return target;
	}

	return source;
}

// Backported from Chart.js 225bfd3. No need for 2.7.0 or later.
function _merger(key, target, source, options) {
	var tval = target[key];
	var sval = source[key];

	if (isObject(tval) && isObject(sval)) {
		helpers.merge(tval, sval, options);
	} else {
		target[key] = clone(sval);
	}
}

// Backported from Chart.js 225bfd3. No need for 2.7.0 or later.
helpers.merge = function(target, source, options) {
	var sources = helpers.isArray(source)? source : [source];
	var ilen = sources.length;
	var merge, i, keys, klen, k;

	if (!isObject(target)) {
		return target;
	}

	options = options || {};
	merge = options.merger || _merger;

	for (i=0; i<ilen; ++i) {
		source = sources[i];
		if (!isObject(source)) {
			continue;
		}

		keys = Object.keys(source);
		for (k=0, klen = keys.length; k<klen; ++k) {
			merge(keys[k], target, source, options);
		}
	}

	return target;
};

// Backported from Chart.js 225bfd3. No need for 2.7.0 or later.
helpers.scaleMerge = function(/* objects ... */) {
	return helpers.merge(clone(arguments[0]), [].slice.call(arguments, 1), {
		merger: function(key, target, source, options) {
			if (key === 'xAxes' || key === 'yAxes') {
				var slen = source[key].length;
				var i, type, scale, defaults;

				if (!target[key]) {
					target[key] = [];
				}

				for (i = 0; i < slen; ++i) {
					scale = source[key][i];
					type = valueOrDefault(scale.type, key === 'xAxes'? 'category' : 'linear');
					defaults = Chart.scaleService.getScaleDefaults(type);

					if (i >= target[key].length) {
						target[key].push({});
					}

					if (!target[key][i].type || (scale.type && scale.type !== target[key][i].type)) {
						// new/untyped scale or type changed: let's apply the new defaults
						// then merge source scale to correctly overwrite the defaults.
						helpers.merge(target[key][i], [defaults, scale]);
					} else {
						// scales type are the same
						helpers.merge(target[key][i], scale);
					}
				}
			} else {
				_merger(key, target, source, options);
			}
		}
	});
};

// Workaround for Chart.js issue #4450
Chart.plugins.getAll().forEach(function(plugin) {
	if (plugin.id === 'filler') {
		var beforeDatasetDraw = plugin.beforeDatasetDraw;
		plugin.beforeDatasetDraw = function(chart, args) {
			helpers.canvas.clipArea(chart.ctx, chart.chartArea);
			beforeDatasetDraw(chart, args);
			helpers.canvas.unclipArea(chart.ctx);
		};
	}
});

// Backported from Chart.js 7f15beb. No need for 2.7.0 or later.
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

// Backported from Chart.js 7f15beb. No need for 2.7.0 or later.
function generateTicksNiceRange(options, dataRange, niceRange) {
	var ticks = [];
	if (options.maxTicks) {
		var stepSize = options.stepSize;
		var startTick = options.min !== undefined ? options.min : niceRange.min;
		var majorUnit = options.majorUnit;
		var majorUnitStart = majorUnit ? moment(startTick).add(1, majorUnit).startOf(majorUnit) : startTick;
		var startRange = majorUnitStart.valueOf() - startTick;
		var stepValue = interval[options.unit].size * stepSize;
		var startFraction = startRange % stepValue;
		var alignedTick = startTick;
		if (startFraction && majorUnit && !options.timeOpts.round && !options.timeOpts.isoWeekday) {
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

// Backported from Chart.js 7f15beb. No need for 2.7.0 or later.
function determineUnit(minUnit, min, max, maxTicks) {
	var units = Object.keys(interval);
	var unit;
	var numUnits = units.length;

	for (var i = units.indexOf(minUnit); i < numUnits; i++) {
		unit = units[i];
		var unitDetails = interval[unit];
		var steps = (unitDetails.steps && unitDetails.steps[unitDetails.steps.length - 1]) || unitDetails.maxStep;
		if (steps === undefined || Math.ceil((max - min) / (steps * unitDetails.size)) <= maxTicks) {
			break;
		}
	}

	return unit;
}

// Backported from Chart.js 7f15beb. No need for 2.7.0 or later.
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

// Backported from Chart.js 7f15beb. No need for 2.7.0 or later.
function determineStepSize(min, max, unit, maxTicks) {
	// Using our unit, figure out what we need to scale as
	var unitDefinition = interval[unit];
	var unitSizeInMilliSeconds = unitDefinition.size;
	var sizeInUnits = Math.ceil((max - min) / unitSizeInMilliSeconds);
	var multiplier = 1;
	var range = max - min;

	if (unitDefinition.steps) {
		// Have an array of steps
		var numSteps = unitDefinition.steps.length;
		for (var i = 0; i < numSteps && sizeInUnits > maxTicks; i++) {
			multiplier = unitDefinition.steps[i];
			sizeInUnits = Math.ceil(range / (unitSizeInMilliSeconds * multiplier));
		}
	} else {
		while (sizeInUnits > maxTicks && maxTicks > 0) {
			++multiplier;
			sizeInUnits = Math.ceil(range / (unitSizeInMilliSeconds * multiplier));
		}
	}

	return multiplier;
}

// Backported from Chart.js 7f15beb. No need for 2.7.0 or later.
function generateTicks(options, dataRange) {
	var niceMin;
	var niceMax;
	var isoWeekday = options.timeOpts.isoWeekday;
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
	return generateTicksNiceRange(options, dataRange, {
		min: niceMin,
		max: niceMax
	});
}

var transitionKeys = {
	x: {
		data: ['x', 'controlPointPreviousX', 'controlPointNextX'],
		dataset: ['x'],
		tooltip: ['x', 'caretX']
	},
	y: {
		data: ['y', 'controlPointPreviousY', 'controlPointNextY'],
		dataset: ['y'],
		tooltip: ['y', 'caretY']
	}
};

function transition(element, keys, translate) {
	var start = element._start || {};
	var view = element._view || {};
	var model = element._model || {};

	var ilen = keys.length;
	for (var i=0; i<ilen; ++i) {
		var key = keys[i];
		if (start.hasOwnProperty(key)) {
			start[key] -= translate;
		}
		if (view.hasOwnProperty(key) && view !== start) {
			view[key] -= translate;
		}
		if (model.hasOwnProperty(key) && model !== view) {
			model[key] -= translate;
		}
	}
}

var TimeScale = Chart.scaleService.getScaleConstructor('time');

Chart.scaleService.getScaleConstructor = function(type) {
	// For backwards compatibility
	if (type === 'time') {
		type = 'realtime';
	}
	return this.constructors.hasOwnProperty(type) ? this.constructors[type] : undefined;
};

var RealTimeScale = TimeScale.extend({
	initialize: function() {
		TimeScale.prototype.initialize.call(this);

		var me = this;
		var options = me.options;

		// For backwards compatibility
		if (options.type === 'time' && !me.chart.options.plugins.streaming) {
			return;
		}

		var nextRefresh = Date.now();
		var prev = Date.now();

		var frameRefresh = function() {
			var chart = me.chart;
			var realtimeOpts = options.realtime;
			var duration = realtimeOpts.duration;
			var refresh = realtimeOpts.refresh;
			var keys, length;

			if (me.isHorizontal()) {
				length = me.width;
				keys = transitionKeys.x;
			} else {
				length = me.height;
				keys = transitionKeys.y;
			}

			var now = Date.now();
			var offset = length * (now - prev) / duration;

			// Shift all the elements leftward or upward
			helpers.each(chart.data.datasets, function(dataset, datasetIndex) {
				var meta = chart.getDatasetMeta(datasetIndex);
				var elements = meta.data || [];
				var ilen = elements.length;

				for (var i=0; i<ilen; ++i) {
					transition(elements[i], keys.data, offset);
				}

				if (meta.dataset) {
					transition(meta.dataset, keys.dataset, offset);
				}
			});

			transition(chart.tooltip, keys.tooltip, offset);

			if (now >= nextRefresh) {
				nextRefresh = now + refresh + (now - nextRefresh) % refresh;
				if (realtimeOpts.onRefresh) {
					realtimeOpts.onRefresh.call(chart, me);
				}

				chart.update();

			} else {
				// Update min/max
				me.max = now - realtimeOpts.delay;
				me.min = me.max - duration;

				// Draw only when animation is inactive
				if (!chart.animating) {
					chart.draw();
				}
			}

			prev = now;

			helpers.requestAnimFrame.call(window, frameRefresh);
		};
		helpers.requestAnimFrame.call(window, frameRefresh);
	},

	buildTicks: function() {
		var me = this;
		var options = me.options;

		// For backwards compatibility
		if (options.type === 'time' && !me.chart.options.plugins.streaming) {
			TimeScale.prototype.buildTicks.call(this);
			return;
		}

		var timeOpts = options.time;
		var realtimeOpts = options.realtime;

		var maxTimestamp = Date.now() - realtimeOpts.delay;
		var minTimestamp = maxTimestamp - realtimeOpts.duration;
		var maxTicks = me.getLabelCapacity(minTimestamp);

		var unit = timeOpts.unit || determineUnit(timeOpts.minUnit, minTimestamp, maxTimestamp, maxTicks);
		var majorUnit = determineMajorUnit(unit);

		me.displayFormat = timeOpts.displayFormats[unit];
		me.majorDisplayFormat = timeOpts.displayFormats[majorUnit];
		me.unit = unit;
		me.majorUnit = majorUnit;

		var optionStepSize = valueOrDefault(timeOpts.stepSize, timeOpts.unitStepSize);
		var stepSize = optionStepSize || determineStepSize(minTimestamp, maxTimestamp, unit, maxTicks);
		me.ticks = generateTicks({
			maxTicks: maxTicks,
			min: minTimestamp,
			// Add refresh interval for scroll margin
			max: maxTimestamp + realtimeOpts.refresh,
			stepSize: stepSize,
			majorUnit: majorUnit,
			unit: unit,
			timeOpts: timeOpts
		}, {
			min: me.dataMin,
			max: me.dataMax
		});

		// max and min are set based on the duration and delay settings
		me.max = maxTimestamp;
		me.min = minTimestamp;
	},

	draw: function(chartArea) {
		var me = this;
		var chart = me.chart;

		// For backwards compatibility
		if (me.options.type === 'time' && !chart.options.plugins.streaming) {
			return TimeScale.prototype.draw.call(this, chartArea);
		}

		var context = me.ctx;
		var	clipArea = me.isHorizontal() ? {
			left: chartArea.left,
			top: 0,
			right: chartArea.right,
			bottom: chart.height
		} : {
			left: 0,
			top: chartArea.top,
			right: chart.width,
			bottom: chartArea.bottom
		};

		// Clip and draw the scale
		helpers.canvas.clipArea(context, clipArea);
		TimeScale.prototype.draw.call(this, chartArea);
		helpers.canvas.unclipArea(context);
	},

	getPixelForOffset: function(offset) {
		var me = this;

		// For backwards compatibility
		if (me.options.type === 'time' && !me.chart.options.plugins.streaming) {
			return TimeScale.prototype.getPixelForOffset.call(this, offset);
		}

		var epochWidth = me.max - me.min;
		var decimal = epochWidth ? (offset - me.min) / epochWidth : 0;

		// For smooth scroll, don't round the offset
		if (me.isHorizontal()) {
			return me.left + me.width * decimal;
		}

		return me.top + me.height * decimal;
	}
});

Chart.scaleService.registerScaleType('realtime', RealTimeScale, realTimeScaleDefaultConfig);

function onRefresh(scale) {
	var me = this;
	var streamingOpts = me.options.plugins.streaming;
	var key = scale.isHorizontal() ? 'x' : 'y';
	var min = Date.now() - streamingOpts.delay - streamingOpts.duration - streamingOpts.refresh*2;

	if (streamingOpts.onRefresh) {
		streamingOpts.onRefresh(me);
	}

	// Remove old data
	me.data.datasets.forEach(function(dataset) {
		var data = dataset.data;
		var howMany = 0;
		for (; howMany < data.length; ++howMany) {
			if (moment(data[howMany][key]).valueOf() > min) {
				break;
			}
		}
		data.splice(0, howMany);
	});
}

var streamingPlugin = {
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

plugins.register(streamingPlugin);
export default streamingPlugin;
