import { crawlRnkData } from './rnkData.js';
import { crawlToiletPaperData } from './toiletPaperData.js';
import { crawlAirData } from './airData.js';
import { generateStats } from '../statistics/index.js';

export const crawlData = async () => {
  const rnkData = await crawlRnkData();
  const toiletPaperData = await crawlToiletPaperData();
  const airData = await crawlAirData();

  const stats = generateStats(rnkData, toiletPaperData, airData);

  return {
      rnkData,
      toiletPaperData,
      airData,
      stats
  };
}