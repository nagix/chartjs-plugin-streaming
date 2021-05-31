import { Chart, ChartComponent, ChartType, TimeScale, TimeScaleOptions, Plugin } from 'chart.js';

interface Options {
  duration?: number;
  delay?: number;
  frameRate?: number;
  refresh?: number;
  onRefresh?: (this: RealTimeScale, chart: Chart) => void | null;
  pause?: boolean;
  ttl?: number;
}

export type RealTimeScaleOptions = TimeScaleOptions & {
  realtime: Options;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RealTimeScale<O extends RealTimeScaleOptions = RealTimeScaleOptions> extends TimeScale<O> {}

export const RealTimeScale: ChartComponent & {
  prototype: RealTimeScale;
  new <O extends RealTimeScaleOptions = RealTimeScaleOptions>(cfg: Record<string, unknown>): RealTimeScale<O>;
};

declare module 'chart.js' {
  interface CartesianScaleTypeRegistry {
    realtime: {
      options: RealTimeScaleOptions;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    /**
     * Per chart streaming plugin options.
     */
    streaming?: Options;
  }

  enum UpdateModeEnum {
    quiet = 'quiet'
  }
}

declare const registerables: ChartComponent[];

export const StreamingPlugin: Plugin;
export default registerables;
