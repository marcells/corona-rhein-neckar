import { stores, amountPerStore } from '../toiletpaper.js';

export const crawlToiletPaperData = async () => {
  console.log(`Loading toiletpaper amount...`);

  const crawledAvailableData = stores
      .map(async x => ({
          store: x,
          amountPerStoreResult: await amountPerStore(x.id)
      }));

  const crawledData = await Promise.all(crawledAvailableData);

  console.log();
  console.log('Finished loading.')
  console.log();

  return crawledData.map(x => ({
    store: x.store,
    amount: x.amountPerStoreResult.amount
  }));
};