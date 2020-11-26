import got from 'got';

export const crawlWorldwideData = async () => {
  console.log(`Loading worldwide data...`);

  const countriesResponse = await got('https://corona-api.com/countries');
    
  const timelineData = await tryGetTimelineData();
  const countriesData = JSON.parse(countriesResponse.body).data;

  console.log();
  console.log('Finished loading.')
  console.log();

  return {
    countries: countriesData,
    timeline: timelineData
  };
};

const tryGetTimelineData = async () => {
  try {
    const timelineResponse = await got('https://corona-api.com/timeline');
    
    return JSON.parse(timelineResponse.body).data;
  } catch {
    return [];
  }
};