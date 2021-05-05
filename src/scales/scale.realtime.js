'use strict';

import Chart from 'chart.js';
import moment from 'moment';
import streamingHelpers from '../helpers/helpers.streaming';

var helpers = Chart.helpers;
var canvasHelpers = helpers.canvas;
var scaleService = Chart.scaleService;
var TimeScale = scaleService.getScaleConstructor('time');

scaleService.getScaleConstructor = function(type) {
	// For backwards compatibility
	if (type === 'time') {
		type = 'realtime';
	}
	return this.constructors.hasOwnProperty(type) ? this.constructors[type] : undefined;
};

// Ported from Chart.js 2.8.0 35273ee.
var MAX_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

// Ported from Chart.js 2.8.0 35273ee.
var INTERVALS = {
	millisecond: {
		common: true,
		size: 1,
		steps: [1, 2, 5, 10, 20, 50, 100, 250, 500]
	},
	second: {
		common: true,
		size: 1000,
		steps: [1, 2, 5, 10, 15, 30]
	},
	minute: {
		common: true,
		size: 60000,
		steps: [1, 2, 5, 10, 15, 30]
	},
	hour: {
		common: true,
		size: 3600000,
		steps: [1, 2, 3, 6, 12]
	},
	day: {
		common: true,
		size: 86400000,
		steps: [1, 2, 5]
	},
	week: {
		common: false,
		size: 604800000,
		steps: [1, 2, 3, 4]
	},
	month: {
		common: true,
		size: 2.628e9,
		steps: [1, 2, 3]
	},
	quarter: {
		common: false,
		size: 7.884e9,
		steps: [1, 2, 3, 4]
	},
	year: {
		common: true,
		size: 3.154e10
	}
};

// Ported from Chart.js 2.8.0 35273ee.
var UNITS = Object.keys(INTERVALS);

// For Chart.js 2.7.x backward compatibility
var defaultAdapter = {
	// Ported from Chart.js 2.9.4 707e52a.
	parse: function(value, format) {
		if (typeof value === 'string' && typeof format === 'string') {
			value = moment(value, format);
		} else if (!(value instanceof moment)) {
			value = moment(value);
		}
		return value.isValid() ? value.valueOf() : null;
	},

	// Ported from Chart.js 2.9.4 707e52a.
	add: function(time, amount, unit) {
		return moment(time).add(amount, unit).valueOf();
	},

	// Ported from Chart.js 2.9.4 707e52a.
	startOf: function(time, unit, weekday) {
		time = moment(time);
		if (unit === 'isoWeek') {
			return time.isoWeekday(weekday).valueOf();
		}
		return time.startOf(unit).valueOf();
	}
};

// Ported from Chart.js 2.8.0 35273ee. Modified for Chart.js 2.7.x backward compatibility.
function toTimestamp(scale, input) {
	var adapter = scale._adapter || defaultAdapter;
	var options = scale.options.time;
	var parser = options.parser;
	var format = parser || options.format;
	var value = input;

	if (typeof parser === 'function') {
		value = parser(value);
	}

	// Only parse if its not a timestamp already
	if (typeof value !== 'number' && !(value instanceof Number) || !isFinite(value)) {
		value = typeof format === 'string'
			? adapter.parse(value, format)
			: adapter.parse(value);
	}

	if (value !== null) {
		return +value;
	}

	// Labels are in an incompatible format and no `parser` has been provided.
	// The user might still use the deprecated `format` option for parsing.
	if (!parser && typeof format === 'function') {
		value = format(input);

		// `format` could return something else than a timestamp, if so, parse it
		if (typeof value !== 'number' && !(value instanceof Number) || !isFinite(value)) {
			value = adapter.parse(value);
		}
	}

	return value;
}

// Ported from Chart.js 2.8.0 35273ee. Modified for Chart.js 2.7.x backward compatibility.
function parse(scale, input) {
	if (helpers.isNullOrUndef(input)) {
		return null;
	}

	var options = scale.options.time;
	var value = toTimestamp(scale, scale.getRightValue(input));
	if (value === null) {
		return value;
	}

	if (options.round) {
		value = +(scale._adapter || defaultAdapter).startOf(value, options.round);
	}

	return value;
}

// Ported from Chart.js 2.8.0 35273ee.
function determineStepSize(min, max, unit, capacity) {
	var range = max - min;
	var interval = INTERVALS[unit];
	var milliseconds = interval.size;
	var steps = interval.steps;
	var i, ilen, factor;

	if (!steps) {
		return Math.ceil(range / (capacity * milliseconds));
	}

	for (i = 0, ilen = steps.length; i < ilen; ++i) {
		factor = steps[i];
		if (Math.ceil(range / (milliseconds * factor)) <= capacity) {
			break;
		}
	}

	return factor;
}

// Ported from Chart.js 2.8.0 35273ee.
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
	var ilen = UNITS.length;
	var i, interval, factor;

	for (i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
		interval = INTERVALS[UNITS[i]];
		factor = interval.steps ? interval.steps[interval.steps.length - 1] : MAX_INTEGER;

		if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
			return UNITS[i];
		}
	}

	return UNITS[ilen - 1];
}

// Ported from Chart.js 2.8.0 35273ee.
function determineMajorUnit(unit) {
	for (var i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
		if (INTERVALS[UNITS[i]].common) {
			return UNITS[i];
		}
	}
}

// Ported from Chart.js 2.8.0 35273ee. Modified for Chart.js 2.7.x backward compatibility.
function generate(scale, min, max, capacity) {
	var adapter = scale._adapter || defaultAdapter;
	var options = scale.options;
	var timeOpts = options.time;
	var minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, capacity);
	var major = determineMajorUnit(minor);
	var stepSize = helpers.valueOrDefault(timeOpts.stepSize, timeOpts.unitStepSize);
	var weekday = minor === 'week' ? timeOpts.isoWeekday : false;
	var majorTicksEnabled = options.ticks.major.enabled;
	var interval = INTERVALS[minor];
	var first = min;
	var last = max;
	var ticks = [];
	var time;

	if (!stepSize) {
		stepSize = determineStepSize(min, max, minor, capacity);
	}

	// For 'week' unit, handle the first day of week option
	if (weekday) {
		first = +adapter.startOf(first, 'isoWeek', weekday);
		last = +adapter.startOf(last, 'isoWeek', weekday);
	}

	// Align first/last ticks on unit
	first = +adapter.startOf(first, weekday ? 'day' : minor);
	last = +adapter.startOf(last, weekday ? 'day' : minor);

	// Make sure that the last tick include max
	if (last < max) {
		last = +adapter.add(last, 1, minor);
	}

	time = first;

	if (majorTicksEnabled && major && !weekday && !timeOpts.round) {
		// Align the first tick on the previous `minor` unit aligned on the `major` unit:
		// we first aligned time on the previous `major` unit then add the number of full
		// stepSize there is between first and the previous major time.
		time = +adapter.startOf(time, major);
		time = +adapter.add(time, ~~((first - time) / (interval.size * stepSize)) * stepSize, minor);
	}

	for (; time < last; time = +adapter.add(time, stepSize, minor)) {
		ticks.push(+time);
	}

	ticks.push(+time);

	return ticks;
}

function resolveOption(scale, key) {
	var realtimeOpts = scale.options.realtime;
	var streamingOpts = scale.chart.options.plugins.streaming;
	return helpers.valueOrDefault(realtimeOpts[key], streamingOpts[key]);
}

var datasetPropertyKeys = [
	'pointBackgroundColor',
	'pointBorderColor',
	'pointBorderWidth',
	'pointRadius',
	'pointRotation',
	'pointStyle',
	'pointHitRadius',
	'pointHoverBackgroundColor',
	'pointHoverBorderColor',
	'pointHoverBorderWidth',
	'pointHoverRadius',
	'backgroundColor',
	'borderColor',
	'borderSkipped',
	'borderWidth',
	'hoverBackgroundColor',
	'hoverBorderColor',
	'hoverBorderWidth',
	'hoverRadius',
	'hitRadius',
	'radius',
	'rotation'
];

function refreshData(scale) {
	var chart = scale.chart;
	var id = scale.id;
	var duration = resolveOption(scale, 'duration');
	var delay = resolveOption(scale, 'delay');
	var ttl = resolveOption(scale, 'ttl');
	var pause = resolveOption(scale, 'pause');
	var onRefresh = resolveOption(scale, 'onRefresh');
	var max = scale.max;
	var min = Date.now() - (isNaN(ttl) ? duration + delay : ttl);
	var meta, data, length, i, start, count, removalRange;

	if (onRefresh) {
		onRefresh(chart);
	}

	// Remove old data
	chart.data.datasets.forEach(function(dataset, datasetIndex) {
		meta = chart.getDatasetMeta(datasetIndex);
		if (id === meta.xAxisID || id === meta.yAxisID) {
			data = dataset.data;
			length = data.length;

			if (pause) {
				// If the scale is paused, preserve the visible data points
				for (i = 0; i < length; ++i) {
					if (!(scale._getTimeForIndex(i, datasetIndex) < max)) {
						break;
					}
				}
				start = i + 2;
			} else {
				start = 0;
			}

			for (i = start; i < length; ++i) {
				if (!(scale._getTimeForIndex(i, datasetIndex) <= min)) {
					break;
				}
			}
			count = i - start;
			if (isNaN(ttl)) {
				// Keep the last two data points outside the range not to affect the existing bezier curve
				count = Math.max(count - 2, 0);
			}

			data.splice(start, count);
			datasetPropertyKeys.forEach(function(key) {
				if (dataset.hasOwnProperty(key) && helpers.isArray(dataset[key])) {
					dataset[key].splice(start, count);
				}
			});
			helpers.each(dataset.datalabels, function(value) {
				if (helpers.isArray(value)) {
					value.splice(start, count);
				}
			});
			if (typeof data[0] !== 'object') {
				removalRange = {
					start: start,
					count: count
				};
			}
		}
	});
	if (removalRange) {
		chart.data.labels.splice(removalRange.start, removalRange.count);
	}

	chart.update({
		preservation: true
	});
}

function stopDataRefreshTimer(scale) {
	var realtime = scale.realtime;
	var refreshTimerID = realtime.refreshTimerID;

	if (refreshTimerID) {
		clearInterval(refreshTimerID);
		delete realtime.refreshTimerID;
		delete realtime.refreshInterval;
	}
}

function startDataRefreshTimer(scale) {
	var realtime = scale.realtime;
	var interval = resolveOption(scale, 'refresh');

	realtime.refreshTimerID = setInterval(function() {
		var newInterval = resolveOption(scale, 'refresh');

		refreshData(scale);
		if (realtime.refreshInterval !== newInterval && !isNaN(newInterval)) {
			stopDataRefreshTimer(scale);
			startDataRefreshTimer(scale);
		}
	}, interval);
	realtime.refreshInterval = interval;
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
	var i, ilen;

	for (i = 0, ilen = keys.length; i < ilen; ++i) {
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

function scroll(scale) {
	var chart = scale.chart;
	var realtime = scale.realtime;
	var duration = resolveOption(scale, 'duration');
	var delay = resolveOption(scale, 'delay');
	var isHorizontal = scale.isHorizontal();
	var reverse = scale.options.ticks.reverse || !(isHorizontal || '_reversePixels' in scale);
	var id = scale.id;
	var tooltip = chart.tooltip;
	var activeTooltip = tooltip._active;
	var now = Date.now();
	var length, keys, offset, meta, elements, i, ilen;

	if (isHorizontal) {
		length = scale.width;
		keys = transitionKeys.x;
	} else {
		length = scale.height;
		keys = transitionKeys.y;
	}
	offset = length * (now - realtime.head) / duration;

	if (isHorizontal === reverse) {
		offset = -offset;
	}

	// Shift all the elements leftward or downward
	helpers.each(chart.data.datasets, function(dataset, datasetIndex) {
		meta = chart.getDatasetMeta(datasetIndex);
		if (id === meta.xAxisID || id === meta.yAxisID) {
			elements = meta.data || [];

			for (i = 0, ilen = elements.length; i < ilen; ++i) {
				transition(elements[i], keys.data, offset);
			}

			if (meta.dataset) {
				transition(meta.dataset, keys.dataset, offset);
			}
		}
	});

	// Shift tooltip leftward or downward
	if (activeTooltip && activeTooltip[0]) {
		meta = chart.getDatasetMeta(activeTooltip[0]._datasetIndex);
		if (id === meta.xAxisID || id === meta.yAxisID) {
			transition(tooltip, keys.tooltip, offset);
		}
	}

	scale.max = scale._table[1].time = now - delay;
	scale.min = scale._table[0].time = scale.max - duration;

	realtime.head = now;
}

var defaultConfig = {
	position: 'bottom',
	distribution: 'linear',
	bounds: 'data',
	adapters: {},
	time: {
		parser: false, // false == a pattern string from http://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
		unit: false, // false == automatic or override with week, month, year, etc.
		round: false, // none, or override with week, month, year, etc.
		displayFormat: false, // DEPRECATED
		isoWeekday: false, // override week start day - see http://momentjs.com/docs/#/get-set/iso-weekday/
		minUnit: 'millisecond',

		// defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
		displayFormats: {
			millisecond: 'h:mm:ss.SSS a',
			second: 'h:mm:ss a',
			minute: 'h:mm a',
			hour: 'hA',
			day: 'MMM D',
			week: 'll',
			month: 'MMM YYYY',
			quarter: '[Q]Q - YYYY',
			year: 'YYYY'
		},
	},
	realtime: {},
	ticks: {
		autoSkip: false,
		source: 'auto',
		major: {
			enabled: true
		}
	}
};

var RealTimeScale = TimeScale.extend({
	initialize: function() {
		var me = this;

		TimeScale.prototype.initialize.apply(me, arguments);

		// For backwards compatibility
		if (me.options.type === 'time' && !me.chart.options.plugins.streaming) {
			return;
		}

		me.realtime = me.realtime || {};

		startDataRefreshTimer(me);
	},

	update: function() {
		var me = this;
		var realtime = me.realtime;
		var options = me.options;
		var bounds = options.bounds;
		var distribution = options.distribution;
		var offset = options.offset;
		var ticksOpts = options.ticks;
		var autoSkip = ticksOpts.autoSkip;
		var source = ticksOpts.source;
		var minTick = ticksOpts.min;
		var maxTick = ticksOpts.max;
		var majorTicksOpts = ticksOpts.major;
		var majorEnabled = majorTicksOpts.enabled;
		var minSize;

		// For backwards compatibility
		if (options.type === 'time' && !me.chart.options.plugins.streaming) {
			return TimeScale.prototype.update.apply(me, arguments);
		}

		if (resolveOption(me, 'pause')) {
			streamingHelpers.stopFrameRefreshTimer(realtime);
		} else {
			streamingHelpers.startFrameRefreshTimer(realtime, function() {
				scroll(me);
			});
			realtime.head = Date.now();
		}

		options.bounds = undefined;
		options.distribution = 'linear';
		options.offset = false;
		ticksOpts.autoSkip = false;
		ticksOpts.source = source === 'auto' ? '' : source;
		ticksOpts.min = -1e15;
		ticksOpts.max = 1e15;
		majorTicksOpts.enabled = true;

		minSize = TimeScale.prototype.update.apply(me, arguments);

		options.bounds = bounds;
		options.distribution = distribution;
		options.offset = offset;
		ticksOpts.autoSkip = autoSkip;
		ticksOpts.source = source;
		ticksOpts.min = minTick;
		ticksOpts.max = maxTick;
		majorTicksOpts.enabled = majorEnabled;

		return minSize;
	},

	buildTicks: function() {
		var me = this;
		var options = me.options;

		// For backwards compatibility
		if (options.type === 'time' && !me.chart.options.plugins.streaming) {
			return TimeScale.prototype.buildTicks.apply(me, arguments);
		}

		var duration = resolveOption(me, 'duration');
		var delay = resolveOption(me, 'delay');
		var refresh = resolveOption(me, 'refresh');
		var ticksOpts = options.ticks;
		var source = ticksOpts.source;
		var timestamps = me._timestamps.data;
		var max = me.realtime.head - delay;
		var min = max - duration;
		var maxArray = [max + refresh, max];
		var ticks;

		if (source === '') {
			ticksOpts.source = 'data';
			me._timestamps.data = generate(me, min, max + refresh, me.getLabelCapacity(min), options);
		}

		Object.defineProperty(me, 'min', {
			get: function() {
				return min;
			},
			set: helpers.noop
		});
		Object.defineProperty(me, 'max', {
			get: function() {
				return maxArray.shift();
			},
			set: helpers.noop
		});

		ticks = TimeScale.prototype.buildTicks.apply(me, arguments);

		delete me.min;
		delete me.max;
		me.min = min;
		me.max = max;

		if (source === '') {
			ticksOpts.source = source;
			me._timestamps.data = timestamps;
		}

		me._table = [{time: min, pos: 0}, {time: max, pos: 1}];

		return ticks;
	},

	calculateTickRotation: function() {
		var me = this;
		var options = me.options;
		var ticksOpts = options.ticks;
		var maxRotation = ticksOpts.maxRotation;

		// For backwards compatibility
		if (options.type === 'time' && !me.chart.options.plugins.streaming) {
			TimeScale.prototype.calculateTickRotation.apply(me, arguments);
			return;
		}

		ticksOpts.maxRotation = ticksOpts.minRotation || 0;
		TimeScale.prototype.calculateTickRotation.apply(me, arguments);
		ticksOpts.maxRotation = maxRotation;
	},

	fit: function() {
		var me = this;
		var options = me.options;

		TimeScale.prototype.fit.apply(me, arguments);

		// For backwards compatibility
		if (options.type === 'time' && !me.chart.options.plugins.streaming) {
			return;
		}

		if (options.ticks.display && options.display && me.isHorizontal()) {
			me.paddingLeft = 3;
			me.paddingRight = 3;
			me.handleMargins();
		}
	},

	draw: function(chartArea) {
		var me = this;
		var chart = me.chart;

		// For backwards compatibility
		if (me.options.type === 'time' && !chart.options.plugins.streaming) {
			TimeScale.prototype.draw.apply(me, arguments);
			return;
		}

		var context = me.ctx;
		var	clipArea = me.isHorizontal() ?
			{
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

		me._gridLineItems = null;
		me._labelItems = null;

		// Clip and draw the scale
		canvasHelpers.clipArea(context, clipArea);
		TimeScale.prototype.draw.apply(me, arguments);
		canvasHelpers.unclipArea(context);
	},

	destroy: function() {
		var me = this;

		// For backwards compatibility
		if (me.options.type === 'time' && !me.chart.options.plugins.streaming) {
			return;
		}

		streamingHelpers.stopFrameRefreshTimer(me.realtime);
		stopDataRefreshTimer(me);
	},

	/*
	 * @private
	 */
	_getTimeForIndex: function(index, datasetIndex) {
		var me = this;
		var timestamps = me._timestamps;
		var time = timestamps.datasets[datasetIndex][index];
		var value;

		if (helpers.isNullOrUndef(time)) {
			value = me.chart.data.datasets[datasetIndex].data[index];
			if (helpers.isObject(value)) {
				time = parse(me, value);
			} else {
				time = parse(me, timestamps.labels[index]);
			}
		}

		return time;
	}
});

scaleService.registerScaleType('realtime', RealTimeScale, defaultConfig);

export default RealTimeScale;
export {
	defaultConfig as realtimeDefaults
};
