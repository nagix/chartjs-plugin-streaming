'use strict';

import Chart from 'chart.js';
import streamingHelpers from '../helpers/helpers.streaming';

var helpers = Chart.helpers;
var TimeScale = Chart.registry.scales.items['time'] !== undefined ? Chart.registry.scales.items['time'] : undefined;


// Ported from Chart.js 2.8.0-rc.1 35273ee.
function toTimestamp(scale, input) {
	let adapter = scale._adapter;
	let options = scale.options.time;
	let parser = options.parser;
	let format = parser || options.format;
	let value = input;

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

// Scale.getRightValue is removed in Chartjs v3.x.x
// TODO: Which function it correct to use?
// Get the correct value. NaN bad inputs, If the value type is object get the x or y based on whether we are horizontal or not
function getRightValue( scale,rawValue ){
	// Null and undefined values first
	if ( helpers.isNullOrUndef(rawValue) ){
		return NaN;
	}
	// isNaN(object) returns true, so make sure NaN is checking for a number; Discard Infinite values
	if ((typeof rawValue === 'number' || rawValue instanceof Number) && !isFinite(rawValue)) {
		return NaN;
	}

	// If it is in fact an object, dive in one more level
	if (rawValue) {
		if (scale.isHorizontal()) {
			if (rawValue.x !== undefined) {
				return getRightValue(scale,rawValue.x);
			}
		} else if (rawValue.y !== undefined) {
			return getRightValue(scale,rawValue.y);
		}
	}

	// Value is good, return it
	return rawValue;
}

// Ported from Chart.js 2.8.0-rc.1 35273ee
function parse(scale, input) {
	if (helpers.isNullOrUndef(input)) {
		return null;
	}

	let options = scale.options.time;
	let value = toTimestamp(scale,getRightValue(scale,input));
	if (value === null) {
		return value;
	}

	if (options.round) {
		value = +scale._adapter.startOf(value, options.round);
	}

	return value;
}

function resolveOption(scale, key) {
	let realtimeOpts = scale.options.realtime;
	let streamingOpts = scale.chart.options.plugins.streaming;

	if( key === 'onRefresh' ){
		console.dir({
			'key': key,
			'scale': scale,
			'realtimeOpts[onRefresh]': realtimeOpts['onRefresh'],
			'streamingOpts[onRefresh]': streamingOpts['onRefresh'],

			'realtimeOpts[delay]': realtimeOpts['delay'],
			'streamingOpts[delay]': streamingOpts['delay'],
		});
		// return function(){};
	}else{
		return helpers.valueOrDefault(realtimeOpts[key], streamingOpts[key]);
	}
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
	let chart = scale.chart;
	let id = scale.id;
	let duration = resolveOption(scale, 'duration');
	let delay = resolveOption(scale, 'delay');
	let ttl = resolveOption(scale, 'ttl');
	let pause = resolveOption(scale, 'pause');

	// This throw an error with ChartJS v3.0.0
	// let onRefresh = resolveOption(, 'onRefresh');

	let max = scale.max;
	let min = Date.now() - (isNaN(ttl) ? duration + delay : ttl);
	let meta, data, length, i, start, count, removalRange;


	try {
		if( typeof scale.chart.config._config.options.scales[scale.id].realtime.onRefresh !== 'undefined' ){
			let onRefresh = scale.chart.config._config.options.scales[scale.id].realtime.onRefresh;
			onRefresh(chart);
		}
	}catch( e ){
		throw Error('Error to access to the onRefresh callback in config.options.scales['+ scale.id +'].realtime.onRefresh"')
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
	let realtime = scale.realtime;
	let refreshTimerID = realtime.refreshTimerID;

	if (refreshTimerID) {
		clearInterval(refreshTimerID);
		delete realtime.refreshTimerID;
		delete realtime.refreshInterval;
	}
}

function startDataRefreshTimer( scale ){
	let realtime = scale.realtime;
	let interval = resolveOption(scale, 'refresh');

	if( realtime.refreshTimerID === undefined ){
		realtime.refreshTimerID = setInterval(function() {
			let newInterval = resolveOption(scale, 'refresh');

			refreshData(scale);

			if (realtime.refreshInterval !== newInterval && !isNaN(newInterval)) {
				stopDataRefreshTimer(scale);
				startDataRefreshTimer(scale);
			}
		}, interval);
	}

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
	let start = element._start || {};
	let view = element._view || {};
	let model = element._model || {};
	let i, ilen;

	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		let key = keys[i];
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
	let chart = scale.chart;
	let realtime = scale.realtime;
	let duration = resolveOption(scale, 'duration');
	let delay = resolveOption(scale, 'delay');
	let id = scale.id;
	let activeTooltip = chart._active;
	let now = Date.now();
	let length, keys, offset, meta, elements, i, ilen;

	if (scale.isHorizontal()) {
		length = scale.width;
		keys = transitionKeys.x;
	} else {
		length = scale.height;
		keys = transitionKeys.y;
	}
	offset = length * (now - realtime.head) / duration;

	if (scale.options.ticks.reverse) {
		offset = -offset;
	}

	// Shift all the elements leftward or upward
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

	// Shift tooltip leftward or upward
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

class RealTimeScale extends TimeScale {

	init() {
		let me = this;

		TimeScale.prototype.init.apply(me, arguments);

		// For backwards compatibility
		if (me.options.type === 'time' && !me.chart.options.plugins.streaming) {
			return;
		}

		me.realtime = me.realtime || {};

		startDataRefreshTimer(me);
	};

	update() {
		let me = this;
		let realtime = me.realtime;

		// For backwards compatibility
		if (me.options.type === 'time' && !me.chart.options.plugins.streaming) {
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

		return TimeScale.prototype.update.apply(me, arguments);
	};

	buildTicks() {
		let me = this;
		let options = me.options;

		// For backwards compatibility
		if (options.type === 'time' && !me.chart.options.plugins.streaming) {
			return TimeScale.prototype.buildTicks.apply(me, arguments);
		}

		let timeOpts = options.time;
		let majorTicksOpts = options.ticks.major;
		let duration = resolveOption(me, 'duration');
		let delay = resolveOption(me, 'delay');
		let refresh = resolveOption(me, 'refresh');
		let bounds = options.bounds;
		let distribution = options.distribution;
		let offset = options.offset;
		let minTime = timeOpts.min;
		let maxTime = timeOpts.max;
		let majorEnabled = majorTicksOpts.enabled;
		let max = me.realtime.head - delay;
		let min = max - duration;
		let maxArray = [max + refresh, max];
		let ticks;

		options.bounds = undefined;
		options.distribution = 'linear';
		options.offset = false;
		timeOpts.min = -1e15;
		timeOpts.max = 1e15;
		majorTicksOpts.enabled = true;

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
		options.bounds = bounds;
		options.distribution = distribution;
		options.offset = offset;
		timeOpts.min = minTime;
		timeOpts.max = maxTime;
		majorTicksOpts.enabled = majorEnabled;
		me._table = [{time: min, pos: 0}, {time: max, pos: 1}];

		return ticks;
	};

	fit() {
		let me = this;
		let options = me.options;

		TimeScale.prototype.fit.apply(me, arguments);

		// For backwards compatibility
		if (options.type === 'time' && !me.chart.options.plugins.streaming) {
			return;
		}

		if (options.ticks.display && options.display && me.isHorizontal()) {
			me.paddingLeft = 3;
			me.paddingRight = 3;
			me._handleMargins();
		}
	};

	draw(chartArea) {
		let me = this;
		let chart = me.chart;

		// For backwards compatibility
		if (me.options.type === 'time' && !chart.options.plugins.streaming) {
			TimeScale.prototype.draw.apply(me, arguments);
			return;
		}

		let context = me.ctx;
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

		// Clip and draw the scale
		helpers.clipArea(context, clipArea);
		TimeScale.prototype.draw.apply(me, arguments);
		helpers.unclipArea(context);
	};

	destroy() {
		let me = this;

		// For backwards compatibility
		if (me.options.type === 'time' && !me.chart.options.plugins.streaming) {
			return;
		}

		streamingHelpers.stopFrameRefreshTimer(me.realtime);
		stopDataRefreshTimer(me);
	};

	/*
	 * @private
	 */
	_getTimeForIndex(index, datasetIndex) {
		let me = this;
		let timestamps = me.chart.data;
		let time = timestamps.datasets[datasetIndex][index];
		let value;

		if (helpers.isNullOrUndef(time)) {
			value = me.chart.data.datasets[datasetIndex].data[index];
			if (helpers.isObject(value)) {
				time = parse(me, value);
			} else {
				time = parse(me, timestamps.labels[index]);
			}
		}

		return time;
	};

}
RealTimeScale.id = 'realtime';
RealTimeScale.defaults = defaultConfig;

Chart.registry.addScales(RealTimeScale);

export default RealTimeScale;
export {
	defaultConfig as realtimeDefaults
};
