import { sum } from './helper.js'

export const generateGlobalInfections = rnkData => {
  const last = rnkData[rnkData.length - 1];

  return {
    currentInfections: sum(last.additionalData, row => row.currentInfections),
    totalInfections: sum(last.additionalData, row => row.totalInfections),
  };
};