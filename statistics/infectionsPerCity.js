import { onlyLastEightDays, getInfectionsByCity } from './helper.js'

export const generateInfectionsPerCity = rnkData => {
  const dataForEightDays = rnkData.filter(onlyLastEightDays);

  return getInfectionsByCity(dataForEightDays);
};