import moment from 'moment';
import interests from './interests.js';

export const generateStats = resolvedRows => {
  return {
    latestDataAt: generateLatestDataAt(resolvedRows),
    infectionsPerCity: generateInfectionsPerCity(resolvedRows),
    globalInfections: generateGlobalInfections(resolvedRows),
    globalPerDay: generateGlobalPerDay(resolvedRows)
  };
}

const generateLatestDataAt = resolvedRows => {
  const last = resolvedRows[resolvedRows.length - 1];

  return last.date;
};

const generateInfectionsPerCity = resolvedRows => {
  const dataForSevenDays = resolvedRows.filter(onlyLastSevenDays);

  return getInfectionsByCity(dataForSevenDays);
};

const generateGlobalInfections = resolvedRows => {
  const last = resolvedRows[resolvedRows.length - 1];

  return {
    currentInfections: sum(last.additionalData, row => row.currentInfections),
    totalInfections: sum(last.additionalData, row => row.totalInfections),
  };
};

const generateGlobalPerDay = resolvedRows => {
  const globalPerDay = resolvedRows.map((row, index, array) => {
    const rows = array.slice(0, index + 1);
    const dataForSevenDays = rows.filter(onlyLastSevenDays);

    const infectionsPerCity = getInfectionsByCity(dataForSevenDays);
    
    const sumTotalInfections = sum(infectionsPerCity, x => x.totalInfections);
    const sumCurrentInfections = sum(infectionsPerCity, x => x.currentInfections);
    const averageSevenDayPer100000 = dataForSevenDays.length >= 7 ? avg(infectionsPerCity, x => x.sevenDayPer100000) : null;

    return {
      date: row.date,
      increasedInfectionsForSevenDays: averageSevenDayPer100000,
      totalInfections: sumTotalInfections,
      currentInfections: sumCurrentInfections,
    };
  });

  return globalPerDay;
};

const sum = (array, selector) => array.reduce((prev, row) => prev + selector(row), 0);
const avg = (array, selector) => sum(array, selector) / array.length;

const onlyLastSevenDays = (row, _, rows) => {
  const maxDate = moment.max(rows.map(x => moment(x.date)));
  const sevenDaysAgo = moment(maxDate).subtract(7, 'days');

  return moment(row.date).isAfter(sevenDaysAgo);
};

const getInfectionsByCity = dataForSevenDays => {
  const first = dataForSevenDays[0];
  const last = dataForSevenDays[dataForSevenDays.length - 1];

  const getNumberOfIncreasedInfections = city => {
    const oldest = first.additionalData.filter(data => data.city === city)[0];
    const newest = last.additionalData.filter(data => data.city === city)[0];

    return {
      increasedInfectionsForSevenDays: newest.totalInfections - oldest.totalInfections,
      totalInfections: newest.totalInfections,
      currentInfections: newest.currentInfections,
    };
  }

  const infectionsPerCity = interests
    .map(interest => ({
      interest: interest,
      ...getNumberOfIncreasedInfections(interest.city)
    }))
    .map(data => ({
      ...data,
      sevenDayPer100000: data.increasedInfectionsForSevenDays / data.interest.numberOfHabitants * 100000
    }));

  return infectionsPerCity;
};