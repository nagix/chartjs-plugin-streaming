import {getAxisMap} from '../helpers/helpers.streaming';

const transitionKeys = {x: ['x', 'caretX'], y: ['y', 'caretY']};

export function updateTooltip(tooltip) {
  const activeTooltip = tooltip.getActiveElements()[0];

  if (activeTooltip) {
    const meta = tooltip._chart.getDatasetMeta(activeTooltip.datasetIndex);

    tooltip.$streaming = getAxisMap(tooltip, transitionKeys, meta);
  } else {
    tooltip.$streaming = {};
  }
}
