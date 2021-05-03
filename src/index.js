import {Chart} from 'chart.js';
import StreamingPlugin from './plugins/plugin.streaming';
import RealTimeScale from './scales/scale.realtime';

Chart.register(StreamingPlugin, RealTimeScale);

export default StreamingPlugin;
