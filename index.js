import loadData from './crawler.js';

(async function() {
    const { stats, availableData } = await loadData();

    availableData.forEach(x => {
        console.log(`${x.additionalData.length} | ${x.date} | ${x.size}`)
    });

    console.log(stats.range);
    console.table(stats.infectionsPerCity);
})();