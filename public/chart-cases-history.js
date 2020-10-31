registerChart('chart-cases-history', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const days = data.rnkData.map(x => new Date(x.date).toLocaleDateString());

  const series = [];
  data.rnkData.forEach((day, index) => {
    day.additionalData.forEach(row => {
      const foundSeries = series.find(x => x.name == row.city);

      if (!foundSeries) {
          series.push({
              name: row.city,
              data: [row.currentInfections],
              visible: false,
          });
      } else {
          foundSeries.data.push(row.currentInfections);
      }
    });
  });

  Highcharts.chart('chart-cases-history', {
    chart: {
        type: 'line',
        height: 800,
    },
    title: {
        text: chartLink.chartName
    },
    subtitle: {
        text: 'Quelle: rhein-neckar-kreis.de'
    },
    xAxis: {
        categories: days
    },
    yAxis: {
        title: {
            text: 'Anzahl'
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            states: {
                inactive: {
                    opacity: 0.25,
                }
            }
        }
    },
    series: series
  });
});