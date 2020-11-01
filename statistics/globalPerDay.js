import moment from 'moment';
import { getInfectionsByCity, onlyLastSevenDays, sum, avg } from './helper.js'

export const generateGlobalPerDay = (rnkData, airData, worldwideData) => {
  const airDataAverageByDate = getAirDataAverageByDay(airData);
  const worldwideDataByDate = getWorldwideDataByDay(worldwideData);

  const globalPerDay = rnkData.map((row, index, array) => {
    const day = moment(row.date).toDate();
    const rows = array.slice(0, index + 1);
    const rnkDataForSevenDays = rows.filter(onlyLastSevenDays);
    const infectionsPerCity = getInfectionsByCity(rnkDataForSevenDays);

    const sumTotalInfections = sum(infectionsPerCity, x => x.totalInfections);
    const sumCurrentInfections = sum(infectionsPerCity, x => x.currentInfections);
    const averageSevenDayPer100000 = rnkDataForSevenDays.length >= 7 ? avg(infectionsPerCity, x => x.sevenDayPer100000) : null;
    const airDataAverage = airDataAverageByDate.hasOwnProperty(day) ? airDataAverageByDate[day] : null;
    const worldwideTotalInfections = worldwideDataByDate.hasOwnProperty(day) ? worldwideDataByDate[day].totalInfections : null;
    const worldwideCurrentInfections = worldwideDataByDate.hasOwnProperty(day) ? worldwideDataByDate[day].currentInfections : null;
    const worldwideIncreasedInfectionsForSevenDays = getWorldwideSevenDayPer100000(worldwideData, day);

    return {
      date: row.date,
      increasedInfectionsForSevenDays: averageSevenDayPer100000,
      totalInfections: sumTotalInfections,
      currentInfections: sumCurrentInfections,
      airDataAverage: airDataAverage,
      worldwideTotalInfections,
      worldwideCurrentInfections,
      worldwideIncreasedInfectionsForSevenDays,
    };
  });

  return globalPerDay;
};

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
  const sevenDaysAgo = moment(toDay).subtract(7, 'days');

  return rows.filter(row => 
    moment(row.date).isAfter(sevenDaysAgo)
    && moment(row.date).isSameOrBefore(moment(toDay)));
};

const getWorldwideSevenDayPer100000 = (worldwideData, day) => {
  const currentDay = worldwideData.timeline.find(x => moment(x.date).isSame(moment(day)));

  if (currentDay === undefined || currentDay.confirmed === null)
    return null;

  const worldwideDataForSevenDays = onlyLastSevenDaysOfWorldwideData(worldwideData.timeline, day);
  const population = sum(worldwideData.countries, x => x.population);
  const sortedWorldwideData = [...worldwideDataForSevenDays].sort((first, second) => first === second ? 0 : moment(first.date).isBefore(moment(second.date)) ? -1 : 1);

  const first = sortedWorldwideData[0];
  const last = sortedWorldwideData[sortedWorldwideData.length - 1];

  const difference = last.confirmed - first.confirmed;

  return difference / population * 100000;
};