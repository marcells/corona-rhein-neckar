registerChart('chart7', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const days = data.availableData.map(x => new Date(x.date).toLocaleDateString());

  const currentInfectionsSeries = {
    name: 'Aktuelle Infektionen',
    type: 'column',
    yAxis: 0,
    data: []
  };

  const totalInfectionsSeries = {
    name: 'Gesamte Infektionen',
    type: 'spline',
    yAxis: 1,
    data: []
  };

  data.availableData.forEach((day, index) => {
    const currentInfections = day.additionalData.reduce((prev, row) => prev + row.currentInfections, 0);
    const totalInfections = day.additionalData.reduce((prev, row) => prev + row.totalInfections, 0);
    
    currentInfectionsSeries.data.push(currentInfections);
    totalInfectionsSeries.data.push(totalInfections);
  });

  const series = [currentInfectionsSeries, totalInfectionsSeries];

  Highcharts.chart('chart7', {
    chart: {
      zoomType: 'xy',
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
    yAxis: [{
      title: {
        text: 'Aktuelle Infektionen',
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      labels: {
        format: '{value} Fälle',
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      }
    }, {
      title: {
        text: 'Gesamte Infektionen',
        style: {
          color: Highcharts.getOptions().colors[1]
        }
      },
      labels: {
        format: '{value} Fälle',
        style: {
          color: Highcharts.getOptions().colors[1]
        }
      },
      opposite: true
    }],
    tooltip: {
      shared: true
    },
    series: series
  });
});