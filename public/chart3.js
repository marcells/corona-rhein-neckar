registerChart('chart3', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const stats = data.stats.infectionsPerCity.map(x => ({
    name: x.interest.city,
    x: x.sevenDayPer100000,
    y: x.totalInfections,
    z: x.interest.squareKilometers,
    currentInfections: x.currentInfections,
    numberOfHabitants: x.interest.numberOfHabitants,
    squareKilometers: x.interest.squareKilometers
  }));

  Highcharts.chart('chart3', {
    chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy',
        height: 800
    },
    legend: {
        enabled: false
    },
    title: {
        text: chartLink.chartName
    },
    subtitle: {
        text: 'Quelle: rhein-neckar-kreis.de'
    },
    xAxis: {
        gridLineWidth: 1,
        title: {
            text: '7-Tage-Inzidenz'
        },
        labels: {
            format: '{value}'
        },
    },
    yAxis: {
        gridLineWidth: 1,
        title: {
            text: 'Insgesamt Infektionen'
        },
        labels: {
            format: '{value}'
        },
    },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            }
        }
    },
    tooltip: {
        useHTML: true,
        headerFormat: '<table>',
        pointFormat: '<tr><th colspan="2"><h3>{point.name}</h3></th></tr>' +
            '<tr><th>7-Tage-Inzidenz:</th><td>{point.x:.1f}</td></tr>' +
            '<tr><th>Gesamte Infektionen:</th><td>{point.y}</td></tr>' +
            '<tr><th>Aktuelle Infektionen:</th><td>{point.currentInfections}</td></tr>' +
            '<tr><th>Einwohner pro km²:</th><td>{point.z:.1f} Einwohner</td></tr>' +
            '<tr><th>Einwohner:</th><td>{point.numberOfHabitants} Einwohner</td></tr>' +
            '<tr><th>Fläche:</th><td>{point.squareKilometers:.1f} km²</td></tr>',
        footerFormat: '</table>',
        followPointer: true
    },
    series: [{ data: stats }]
  });
});