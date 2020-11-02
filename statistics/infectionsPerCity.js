import { onlyLastEightDays, getInfectionsByCity } from './helper.js'

export const generateInfectionsPerCity = rnkData => {
  const dataForSevenDays = rnkData.filter(onlyLastEightDays);

  return getInfectionsByCity(dataForSevenDays);
};