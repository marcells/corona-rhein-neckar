import express from 'express';
import loadData from './crawler.js';
import { reset } from './crawlerCache.js'

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

app.listen(port, () => {
    console.log(`Corona-Scraper listening at http://localhost:${port}`)
    console.log();
    console.log(`Open your browser on http://localhost:${port} to see the current statistics.`)
});