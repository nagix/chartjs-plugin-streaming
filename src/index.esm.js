import StreamingPlugin from './plugins/plugin.streaming';
import RealTimeScale from './scales/scale.realtime';

const registerables = [StreamingPlugin, RealTimeScale];

export {StreamingPlugin, RealTimeScale, registerables as default};
