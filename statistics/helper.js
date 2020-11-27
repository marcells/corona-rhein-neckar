import moment from 'moment';
import interests from '../interests.js';

export const onlyLastEightDays = (row, _, rows) => onlyLastNDays(8, row, rows);
export const onlyLastNineDays = (row, _, rows) => onlyLastNDays(9, row, rows);

export const getInfectionsByCity = dataForEightDays => {
  const first = dataForEightDays[0];
  const previous = dataForEightDays[dataForEightDays.length - 2];
  const last = dataForEightDays[dataForEightDays.length - 1];

  const getNumberOfIncreasedInfections = city => {
    const oldest = first.additionalData.filter(data => data.city === city)[0];
    const yesterday = previous === undefined ? undefined : previous.additionalData.filter(data => data.city === city)[0];
    const newest = last.additionalData.filter(data => data.city === city)[0];

    if (newest === undefined || oldest === undefined) {
      console.log(`Incorrect data for city '${city}'`);

      return {
        increasedInfectionsForSevenDays: 0,
        increasedInfectionsSinceYesterday: 0,
        totalInfections: 0,
        currentInfections: 0,
      };
    }

    return {
      increasedInfectionsForSevenDays: newest.totalInfections - oldest.totalInfections,
      increasedInfectionsSinceYesterday: yesterday === undefined ? undefined : newest.totalInfections - yesterday.totalInfections,
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

export const sum = (array, selector) => array.reduce((prev, row) => prev + selector(row), 0);

export const avg = (array, selector) => sum(array, selector) / array.length;

const onlyLastNDays = (n, row, rows) => {
  const maxDate = moment.max(rows.map(x => moment(x.date)));
  const eightDaysAgo = moment(maxDate).subtract(n, 'days');

  return moment(row.date).isAfter(eightDaysAgo);
};