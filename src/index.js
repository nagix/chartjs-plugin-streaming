'use strict';

import Chart from 'chart.js';
import moment from 'moment';

import realTimeScale from './scales/scale.realtime';
import streamingPlugin from './plugins/plugin.streaming';

realTimeScale(Chart, moment);

var plugin = streamingPlugin(Chart);
Chart.plugins.register(plugin);
export default plugin;
