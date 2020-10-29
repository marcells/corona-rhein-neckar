import express from 'express';
import loadData from './crawler.js';
import { reset } from './crawlerCache.js'
import { ammountPerStore, stores } from './toiletpaper.js'

const app = express()
const port = 3000

app.use(express.static('public'));

app.get('/api', async (_, res) => {
    const data = await loadData();
    res.send(data);
});

app.put('/api/reset', async (_, res) => {
    await reset(new Date());
    res.sendStatus(200);
});

app.get('/api/toiletpaper/stores', (_, res) => {
    res.send(stores);
});

app.get('/api/toiletpaper/:storeId', async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    if(!stores.map(store => store.id).includes(storeId)) {
        res.send({'error': 'Store ID unknown, check /toiletpaper/stores for valid options'});
    }
    const ammount = await ammountPerStore(storeId)
    res.send(ammount);
});

app.listen(port, async () => {
    console.log(`Corona-Scraper listening at http://localhost:${port}`)
    console.log();
    console.log(`Open your browser on http://localhost:${port} to see the current statistics.`);
    console.log();
    await startCacheRefresher();
});

export const startCacheRefresher = async () => {
  await preLoadData();
  scheduleTimeout();

  function getIntervalUntilNextHour () {
    return 3600000 - new Date().getTime() % 3600000;
  }

  function scheduleTimeout () {
    console.log(`Next automatic cache update in ${getIntervalUntilNextHour() / 1000} seconds...`);

    setTimeout(async () => {
      await preLoadData();

      scheduleTimeout();
    }, getIntervalUntilNextHour());
  }

  async function preLoadData() {
    console.log('Preloading data...');
    await loadData();
  }
};
