import got from 'got';
import moment from 'moment';
import parse from "csv-parse/lib/sync.js";

export const crawlAirData = async () => {
  const currentDate = moment().format('YYYY-MM-DD');
  const airDataUrl = `https://www.umweltbundesamt.de/api/air_data/v2/measures/csv?date_from=2020-10-01&time_from=24&date_to=${currentDate}&time_to=24&data%5B0%5D%5Bco%5D=1&data%5B0%5D%5Bsc%5D=1&data%5B0%5D%5Bda%5D=2020-10-30&data%5B0%5D%5Bti%5D=13&data%5B0%5D%5Bst%5D=216&data%5B0%5D%5Bva%5D=8&data%5B1%5D%5Bco%5D=1&data%5B1%5D%5Bsc%5D=1&data%5B1%5D%5Bda%5D=2020-10-30&data%5B1%5D%5Bti%5D=12&data%5B1%5D%5Bst%5D=299&data%5B1%5D%5Bva%5D=11&data%5B2%5D%5Bco%5D=1&data%5B2%5D%5Bsc%5D=1&data%5B2%5D%5Bda%5D=2020-10-30&data%5B2%5D%5Bti%5D=12&data%5B2%5D%5Bst%5D=220&data%5B2%5D%5Bva%5D=8&data%5B3%5D%5Bco%5D=1&data%5B3%5D%5Bsc%5D=1&data%5B3%5D%5Bda%5D=2020-10-30&data%5B3%5D%5Bti%5D=12&data%5B3%5D%5Bst%5D=221&data%5B3%5D%5Bva%5D=7&lang=de`;
  const response = await got(airDataUrl);
  const csvData = response.body;

  return parse(csvData, {
    cast: true,
    columns: true,
    delimiter: ';',
    relaxColumnCount: true,
    skipEmptyLines: true,
    bom: true,
  })
  .filter(x => x['Datum'])
  .filter(x => x['Messwert'] !== '-');
};