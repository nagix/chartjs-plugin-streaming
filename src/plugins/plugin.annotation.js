import Chart from 'chart.js';

function isValid(rawValue) {
	if (rawValue === null || typeof rawValue === 'undefined') {
		return false;
	} else if (typeof rawValue === 'number') {
		return isFinite(rawValue);
	}
	return !!rawValue;
}

function scaleValue(scale, value, fallback) {
	return isValid(value) ?
		{value: scale.getPixelForValue(value), transitionable: true} :
		{value: fallback};
}

function updateBoxAnnotation(element) {
	var chart = element.chartInstance;
	var options = element.options;
	var scales = chart.scales;
	var chartArea = chart.chartArea;
	var xScaleID = options.xScaleID;
	var yScaleID = options.yScaleID;
	var xScale = scales[xScaleID];
	var yScale = scales[yScaleID];
	var streaming = element._streaming = {};
	var min, max, reverse;

	if (xScale) {
		min = scaleValue(xScale, options.xMin, chartArea.left);
		max = scaleValue(xScale, options.xMax, chartArea.right);
		reverse = min.value > max.value;

		if (min.transitionable) {
			streaming[reverse ? 'right' : 'left'] = {axisId: xScaleID};
		}
		if (max.transitionable) {
			streaming[reverse ? 'left' : 'right'] = {axisId: xScaleID};
		}
	}

	if (yScale) {
		min = scaleValue(yScale, options.yMin, chartArea.top);
		max = scaleValue(yScale, options.yMax, chartArea.bottom);
		reverse = min.value > max.value;

		if (min.transitionable) {
			streaming[reverse ? 'bottom' : 'top'] = {axisId: yScaleID};
		}
		if (max.transitionable) {
			streaming[reverse ? 'top' : 'bottom'] = {axisId: yScaleID};
		}
	}
}

function updateLineAnnotation(element) {
	var chart = element.chartInstance;
	var options = element.options;
	var scaleID = options.scaleID;
	var value = options.value;
	var scale = chart.scales[scaleID];
	var streaming = element._streaming = {};

	if (scale) {
		var isHorizontal = scale.isHorizontal();
		var pixel = scaleValue(scale, value);

		if (pixel.transitionable) {
			streaming[isHorizontal ? 'x1' : 'y1'] = {axisId: scaleID};
			streaming[isHorizontal ? 'x2' : 'y2'] = {axisId: scaleID};
			streaming[isHorizontal ? 'labelX' : 'labelY'] = {axisId: scaleID};
		}
	}
}

function initAnnotationPlugin() {
	var BoxAnnotation = Chart.Annotation.types.box;
	var LineAnnotation = Chart.Annotation.types.line;
	var configureBoxAnnotation = BoxAnnotation.prototype.configure;
	var configureLineAnnotation = LineAnnotation.prototype.configure;

	BoxAnnotation.prototype.configure = function() {
		updateBoxAnnotation(this);
		return configureBoxAnnotation.call(this);
	};

	LineAnnotation.prototype.configure = function() {
		updateLineAnnotation(this);
		return configureLineAnnotation.call(this);
	};
}

export default {
	attachChart(chart) {
		var streaming = chart.streaming;

		if (!streaming.annotationPlugin) {
			initAnnotationPlugin();
			streaming.annotationPlugin = true;
		}
	},

	getElements(chart) {
		var annotation = chart.annotation;

		if (annotation) {
			var elements = annotation.elements;
			return Object.keys(elements).map(function(id) {
				return elements[id];
			});
		}
		return [];
	},

	detachChart(chart) {
		delete chart.streaming.annotationPlugin;
	}
};
