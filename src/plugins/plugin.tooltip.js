import {getAxisMap} from '../helpers/helpers.streaming';

const transitionKeys = {x: ['x', 'caretX'], y: ['y', 'caretY']};

export function update(...args) {
  const me = this;
  const element = me.getActiveElements()[0];

  if (element) {
    const meta = me._chart.getDatasetMeta(element.datasetIndex);

    me.$streaming = getAxisMap(me, transitionKeys, meta);
  } else {
    me.$streaming = {};
  }

  me.constructor.prototype.update.call(me, ...args);
}
