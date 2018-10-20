'use strict';

import Chart from 'chart.js';
import streamingPlugin from './plugins/plugin.streaming';
import './plugins/plugin.zoom';

Chart.plugins.register(streamingPlugin);

export default streamingPlugin;
