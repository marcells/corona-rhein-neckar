import { onlyLastSevenDays, getInfectionsByCity } from './helper.js'

export const generateInfectionsPerCity = rnkData => {
  const dataForSevenDays = rnkData.filter(onlyLastSevenDays);

  return getInfectionsByCity(dataForSevenDays);
};