import { crawlRnkData } from './rnkData.js';
import { crawlToiletPaperData } from './toiletPaperData.js';
import { crawlAirData } from './airData.js';
import { crawlWorldwideData } from './worldwide.js';
import { getOrSave } from '../crawlerCache.js';
import { generateStats } from '../statistics/index.js';

export const crawlData = async () => {
  const rnkData = await getOrSave('rnk', new Date(), crawlRnkData);
  const toiletPaperData = await getOrSave('toiletpaper', new Date(), crawlToiletPaperData);
  const airData = await getOrSave('air', new Date(), crawlAirData);
  const worldwideData = await getOrSave('worldwide', new Date(), crawlWorldwideData);

  const stats = generateStats(rnkData, toiletPaperData, airData, worldwideData);

  return {
      rnkData,
      toiletPaperData,
      airData,
      worldwideData,
      stats
  };
}