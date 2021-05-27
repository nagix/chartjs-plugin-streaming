import {Chart} from 'chart.js';
import StreamingPlugin from './plugins/plugin.streaming';
import RealTimeScale from './scales/scale.realtime';

const registerables = [StreamingPlugin, RealTimeScale];

Chart.register(registerables);

export default registerables;
