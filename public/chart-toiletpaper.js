registerChart('chart-toiletpaper', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const cities = data.stats.toiletPaperPerCity.map(x => x.interest);
  const amountOfToiletPaper = data.stats.toiletPaperPerCity.map(x => x.amount);
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
      text: 'Quelle: rhein-neckar-kreis.de'
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
        text: 'Packungen'
      },
      opposite: true
    }, {
      min: 0,
      title: {
        text: 'Anzahl'
      }
    }],
    tooltip: {
      headerFormat: '<h3>{point.key.city}</h3><table>' +
        '<tr><td>Einwohner</td><td>{point.key.numberOfHabitants} Einwohner</td></tr>' +
        '<tr><td>Fläche:</td><td>{point.key.squareKilometers:.1f} km²</td></tr>',
      pointFormat: '<tr><td style="color:{series.color};padding:0"><b>{series.name}: </b></td>' +
        '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
      footerFormat: '</table>',
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
      name: 'Toilettenpapier (DM-Supermärkte)',
      data: amountOfToiletPaper,
      tooltip: {
        valueDecimals: 0
      }
    }, {
      yAxis: 1,
      name: 'Gesamte Infektionen',
      data: totalInfections
    }, {
      yAxis: 1,
      name: 'Aktuell Infizierte',
      data: currentInfections
    }]
  });
});