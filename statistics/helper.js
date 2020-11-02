import moment from 'moment';
import interests from '../interests.js';

export const onlyLastEightDays = (row, _, rows) => {
  const maxDate = moment.max(rows.map(x => moment(x.date)));
  const eightDaysAgo = moment(maxDate).subtract(8, 'days');

  return moment(row.date).isAfter(eightDaysAgo);
};

export const getInfectionsByCity = dataForSevenDays => {
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

export const sum = (array, selector) => array.reduce((prev, row) => prev + selector(row), 0);

export const avg = (array, selector) => sum(array, selector) / array.length;