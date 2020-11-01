import { generateLatestDataAt } from './latestDataAt.js';
import { generateInfectionsPerCity } from './infectionsPerCity.js';
import { generateGlobalInfections } from './globalInfections.js';
import { generateGlobalPerDay } from './globalPerDay.js';
import { generateToiletPaperPerCity } from './toiletPaperPerCity.js';

export const generateStats = (rnkData, toiletPaperData, airData, worldwideData) => {
  return {
    latestDataAt: generateLatestDataAt(rnkData),
    infectionsPerCity: generateInfectionsPerCity(rnkData),
    globalInfections: generateGlobalInfections(rnkData),
    globalPerDay: generateGlobalPerDay(rnkData, airData, worldwideData),
    toiletPaperPerCity: generateToiletPaperPerCity(toiletPaperData),
  };
}