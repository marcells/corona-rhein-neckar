registerChart('chart-overview', async chartLink => {
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

  const increasedInfectionsForSevenDaysSeries = {
    name: '7-Tage-Inzidenz',
    type: 'spline',
    yAxis: 2,
    data: [],
    tooltip: {
      valueDecimals: 1
    }
  };

  data.stats.globalPerDay.map(day => {
    currentInfectionsSeries.data.push(day.currentInfections);
    totalInfectionsSeries.data.push(day.totalInfections);
    increasedInfectionsForSevenDaysSeries.data.push(day.increasedInfectionsForSevenDays);
  });

  const series = [currentInfectionsSeries, totalInfectionsSeries, increasedInfectionsForSevenDaysSeries];

  Highcharts.chart('chart-overview', {
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
        style: {
          color: Highcharts.getOptions().colors[1]
        }
      },
      opposite: true
    }, {
      title: {
        text: '7-Tage-Inzidenz',
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      },
      labels: {
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      },
    }],
    tooltip: {
      shared: true
    },
    series: series
  });
});