import Chart from 'chart.js';
import * as StreamingHelper from './helpers/helpers.streaming';
import StreamingPlugin from './plugins/plugin.streaming';
import RealTimeScale from './scales/scale.realtime';

Chart.helpers.streaming = StreamingHelper;

Chart.register(StreamingPlugin, RealTimeScale);

export default StreamingPlugin;
