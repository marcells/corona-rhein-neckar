import moment from 'moment';
import { getInfectionsByCity, onlyLastSevenDays, sum, avg } from './helper.js'

export const generateGlobalPerDay = (rnkData, airData, worldwideData) => {
  const airDataAverageByDate = getAirDataAverageByDay(airData);
  const worldwideDataByDate = getWorldwideDataByDay(worldwideData);

  const globalPerDay = rnkData.map((row, index, array) => {
    const day = moment(row.date).toDate();
    const rows = array.slice(0, index + 1);
    const dataForSevenDays = rows.filter(onlyLastSevenDays);

    const infectionsPerCity = getInfectionsByCity(dataForSevenDays);

    const sumTotalInfections = sum(infectionsPerCity, x => x.totalInfections);
    const sumCurrentInfections = sum(infectionsPerCity, x => x.currentInfections);
    const averageSevenDayPer100000 = dataForSevenDays.length >= 7 ? avg(infectionsPerCity, x => x.sevenDayPer100000) : null;
    const airDataAverage = airDataAverageByDate.hasOwnProperty(day) ? airDataAverageByDate[day] : null;
    const worldwideTotalInfections = worldwideDataByDate.hasOwnProperty(day) ? worldwideDataByDate[day].totalInfections : null;
    const worldwideCurrentInfections = worldwideDataByDate.hasOwnProperty(day) ? worldwideDataByDate[day].currentInfections : null;

    return {
      date: row.date,
      increasedInfectionsForSevenDays: averageSevenDayPer100000,
      totalInfections: sumTotalInfections,
      currentInfections: sumCurrentInfections,
      airDataAverage: airDataAverage,
      worldwideTotalInfections,
      worldwideCurrentInfections,
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