import express from 'express';
import loadData from './crawler.js';

const app = express()
const port = 3000

app.get('/', async (req, res) => {
    const data = await loadData();
    res.send(data);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});


(async function() {
    const { stats, availableData } = await loadData();

    availableData.forEach(x => {
        console.log(`${x.additionalData.length} | ${x.date} | ${x.size}`)
    });

    console.log(stats.range);
    console.table(stats.infectionsPerCity);
})();