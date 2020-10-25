(async function() {
  const response = await fetch('/api');
  const data = await response.json();

  const days = data.availableData.map(x => new Date(x.date).toLocaleDateString());

  const series = [];
  data.availableData.forEach((day, index) => {
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

  Highcharts.chart('chart2', {
    chart: {
        type: 'line',
        height: 800,
    },
    title: {
        text: 'Verlauf Infektionen'
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
})();