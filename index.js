import express from 'express';
import loadData from './crawler.js';

const app = express()
const port = 3000

app.use(express.static('public'));

app.get('/api', async (_, res) => {
    const data = await loadData();
    res.send(data);
});

app.listen(port, () => {
    console.log(`Corona-Scraper listening at http://localhost:${port}`)
});

// // Enable this for debug output on console
// (async function() {
//     const { stats, availableData } = await loadData();

//     availableData.forEach(x => {
//         console.log(`${x.additionalData.length} | ${x.date} | ${x.size}`)
//     });

//     console.log(stats.range);
//     console.table(stats.infectionsPerCity);
// })();