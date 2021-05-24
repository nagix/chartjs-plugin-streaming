import {Chart, registerables} from 'chart.js';
import AnnotationPlugin from 'chartjs-plugin-annotation';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import ZoomPlugin from 'chartjs-plugin-zoom';
import StreamingPlugin from '../../dist/chartjs-plugin-streaming.js';

Chart.register(...registerables, AnnotationPlugin, DataLabelsPlugin, ZoomPlugin, StreamingPlugin);
