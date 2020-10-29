registerChart('chart-toiletpaper', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const cities = data.stats.toiletPaperPerCity.map(x => x.interest);
  const amountOfToiletPaper = data.stats.toiletPaperPerCity.map(x => x.amount);
  const amountOfToiletPaperPerHabitant = data.stats.toiletPaperPerCity.map(x => x.amount === null ? null : x.amount / x.interest.numberOfHabitants);
  const sevenDayPer100000 = data.stats.infectionsPerCity.map(x => x.sevenDayPer100000);
  const currentInfections = data.stats.infectionsPerCity.map(x => x.currentInfections);
  const totalInfections = data.stats.infectionsPerCity.map(x => x.totalInfections);

  Highcharts.chart('chart-toiletpaper', {
    chart: {
      type: 'column',
      height: 800,
    },
    title: {
      text: chartLink.chartName
    },
    subtitle: {
      text: '<b>❗ Die Daten beziehen nur auf DM-Drogerien und liegen leider nicht für alle Städte vor. ❗</b>'
    },
    xAxis: {
      categories: cities,
      crosshair: true,
      labels: {
        format: '{value.city}'
      }
    },
    yAxis: [{
      min: 0,
      title: {
        text: 'Verfügbare Packungen',
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      labels: {
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
    }, {
      min: 0,
      title: {
        text: 'Verfügbare Packungen pro Einwohner',
        style: {
          color: Highcharts.getOptions().colors[1]
        }
      },
      labels: {
        style: {
          color: Highcharts.getOptions().colors[1]
        }
      },
    }, {
      min: 0,
      title: {
        text: 'Wert'
      },
      opposite: true
    }],
    tooltip: {
      headerFormat: '<h3>{point.key.city}</h3><table>' +
        '<tr><td>Einwohner:</td><td>{point.key.numberOfHabitants} Einwohner</td></tr>' +
        '<tr><td>Fläche:</td><td>{point.key.squareKilometers:.1f} km²</td></tr></table>' +
        '<br/>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0
      }
    },
    series: [{
      yAxis: 0,
      name: 'Verfügbares Toilettenpapier',
      data: amountOfToiletPaper,
      tooltip: {
        valueDecimals: 0,
        valueSuffix: ' Packungen'
      }
    }, {
      yAxis: 1,
      name: 'Verfügbares Toilettenpapier pro Einwohner',
      data: amountOfToiletPaperPerHabitant,
      tooltip: {
        valueDecimals: 5,
        valueSuffix: ' Packungen'
      }
    }, {
      yAxis: 2,
      name: 'Gesamte Infektionen',
      data: totalInfections,
      visible: false,
    }, {
      yAxis: 2,
      name: 'Aktuell Infizierte',
      data: currentInfections,
      visible: false,
    }, {
      yAxis: 2,
      name: '7-Tage-Inzidenz',
      data: sevenDayPer100000,
      visible: false,
      tooltip: {
        valueDecimals: 1,
      }
    }]
  });
});