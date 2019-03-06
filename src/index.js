'use strict';

import Chart from 'chart.js';
import StreamingHelper from './helpers/helpers.streaming';
import StreamingPlugin from './plugins/plugin.streaming';
import './plugins/plugin.zoom';

Chart.helpers.streaming = StreamingHelper;

Chart.plugins.register(StreamingPlugin);

export default StreamingPlugin;
