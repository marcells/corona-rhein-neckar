import got from 'got';

export const crawlWorldwideData = async () => {
  console.log(`Loading worldwide data...`);

  const countriesResponse = await got('https://corona-api.com/countries');
  const timelineResponse = await got('https://corona-api.com/timeline');
  
  const timelineData = JSON.parse(timelineResponse.body).data;
  const countriesData = JSON.parse(countriesResponse.body).data;

  console.log();
  console.log('Finished loading.')
  console.log();

  return {
    countries: countriesData,
    timeline: timelineData
  };
};