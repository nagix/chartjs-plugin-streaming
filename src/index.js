'use strict';

import Chart from 'chart.js';
import 'chartjs-adapter-moment';
import StreamingHelper from './helpers/helpers.streaming';
import StreamingPlugin from './plugins/plugin.streaming';
import './plugins/plugin.zoom';

Chart.helpers.streaming = StreamingHelper;

Chart.register(StreamingPlugin);

export default StreamingPlugin;
