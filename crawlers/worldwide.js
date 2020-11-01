import got from 'got';

export const crawlWorldwideData = async () => {
  console.log(`Loading worldwide data...`);

  const response = await got('https://corona-api.com/timeline');
  const data = JSON.parse(response.body).data;

  console.log();
  console.log('Finished loading.')
  console.log();

  return data;
};