import moment from 'moment';
import { getInfectionsByCity, onlyLastEightDays, onlyLastNineDays, sum, avg } from './helper.js';
import { sortByDate } from '../helper.js';
import interests from '../interests.js';

export const generateGlobalPerDay = (rnkData, airData, worldwideData) => {
  const airDataAverageByDate = getAirDataAverageByDay(airData);
  const worldwideDataByDate = getWorldwideDataByDay(worldwideData);

  const globalPerDay = rnkData.map((row, index, array) => {
    const day = moment(row.date).toDate();
    const rows = array.slice(0, index + 1);
    const rnkDataForEightDays = rows.filter(onlyLastEightDays);
    const rnkDataForNineDays = rows.filter(onlyLastNineDays);
    const infectionsPerCity = getInfectionsByCity(rnkDataForEightDays);

    const sumTotalInfections = sum(infectionsPerCity, x => x.totalInfections);
    const sumCurrentInfections = sum(infectionsPerCity, x => x.currentInfections);
    const sumIncreasedInfectionsSinceYesterday = sum(infectionsPerCity, x => x.increasedInfectionsSinceYesterday);
    const rValue = getRValue(rnkDataForNineDays);
    const averageSevenDayPer100000 = getSevenDayIncidence(rnkDataForEightDays);
    const airDataAverage = airDataAverageByDate.hasOwnProperty(day) ? airDataAverageByDate[day] : null;
    const worldwideTotalInfections = worldwideDataByDate.hasOwnProperty(day) ? worldwideDataByDate[day].totalInfections : null;
    const worldwideCurrentInfections = worldwideDataByDate.hasOwnProperty(day) ? worldwideDataByDate[day].currentInfections : null;
    const worldwideIncreasedInfectionsForSevenDays = getWorldwideSevenDayPer100000(worldwideData, day);

    return {
      date: row.date,
      increasedInfectionsForSevenDays: averageSevenDayPer100000,
      increasedInfectionsSinceYesterday: sumIncreasedInfectionsSinceYesterday,
      totalInfections: sumTotalInfections,
      rValue: rValue,
      currentInfections: sumCurrentInfections,
      airDataAverage: airDataAverage,
      worldwideTotalInfections,
      worldwideCurrentInfections,
      worldwideIncreasedInfectionsForSevenDays,
    };
  });

  return globalPerDay;
};

const getSevenDayIncidence = rnkDataForEightDays => {
  if (rnkDataForEightDays.length !== 8) {
    return null;
  }
  const start = sum(rnkDataForEightDays[0].additionalData, x => x.totalInfections);
  const end = sum(rnkDataForEightDays[rnkDataForEightDays.length-1].additionalData, x => x.totalInfections);
  const pop = sum(interests, x => x.numberOfHabitants);
  const averageSevenDayPer100000 = (end - start) / pop * 100000;

  return averageSevenDayPer100000;
}

const getRValue = rnkDataForNineDays => {
  if (rnkDataForNineDays.length !== 9) {
    return null;
  }

  const newInfectionsForDay = index => sum(rnkDataForNineDays[index].additionalData, x => x.totalInfections) - sum(rnkDataForNineDays[index - 1].additionalData, x => x.totalInfections);
  
  const first4Days = newInfectionsForDay(1) + newInfectionsForDay(2) + newInfectionsForDay(3) + newInfectionsForDay(4);
  const last4Days = newInfectionsForDay(5) + newInfectionsForDay(6) + newInfectionsForDay(7) + newInfectionsForDay(8);

  return last4Days / first4Days;
}

const getAirDataAverageByDay = airData => {
  const mappedAirData = airData.map(x => ({
    date: moment(x['Datum'], 'DD.MM.YYYY').toDate(),
    value: x['Messwert'],
  }));

  const groupedAirData = mappedAirData.reduce((r, a) => {
    r[a.date] = [...r[a.date] || [], a];
    return r;
  }, {});

  for (const [key, value] of Object.entries(groupedAirData)) {
    groupedAirData[key] = avg(value, x => x.value);
  }

  return groupedAirData;
}

const getWorldwideDataByDay = worldwideData => {
  return worldwideData
    .timeline
    .map(x => ({
      date: moment(x.date, 'YYYY-MM-DD').toDate(),
      currentInfections: x.active,
      totalInfections: x.confirmed,
    }))
    .reduce((r, a) => {
      r[a.date] = { ...a };
      return r;
    }, {});
};

const onlyLastSevenDaysOfWorldwideData = (rows, toDay) => {
  const eightDaysAgo = moment(toDay).subtract(8, 'days');

  return rows.filter(row => 
    moment(row.date).isAfter(eightDaysAgo)
    && moment(row.date).isSameOrBefore(moment(toDay)));
};

const getWorldwideSevenDayPer100000 = (worldwideData, day) => {
  const currentDay = worldwideData.timeline.find(x => moment(x.date).isSame(moment(day)));

  if (currentDay === undefined || currentDay.confirmed === null)
    return null;

  const worldwideDataForSevenDays = onlyLastSevenDaysOfWorldwideData(worldwideData.timeline, day);

  if (worldwideDataForSevenDays.length !== 8) {
    return null;
  }

  const population = sum(worldwideData.countries, x => x.population);
  const sortedWorldwideData = sortByDate(worldwideDataForSevenDays, x => x.date);

  const first = sortedWorldwideData[0];
  const last = sortedWorldwideData[sortedWorldwideData.length - 1];

  const difference = last.confirmed - first.confirmed;

  return difference / population * 100000;
};