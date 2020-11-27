registerChart('chart-seven-days-incidence', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const cities = data.stats.infectionsPerCity.map(x => x.interest);
  const sevenDayPer100000 = data.stats.infectionsPerCity.map(x => x.sevenDayPer100000);
  const totalInfections = data.stats.infectionsPerCity.map(x => x.totalInfections);
  const currentInfections = data.stats.infectionsPerCity.map(x => x.currentInfections);
  const increasedInfectionsSinceYesterday = data.stats.infectionsPerCity.map(x => x.increasedInfectionsSinceYesterday);
  const totalInfectionsPer100000 = data.stats.infectionsPerCity.map(x => x.totalInfections / x.interest.numberOfHabitants * 100000);
  const currentInfectionsPer100000 = data.stats.infectionsPerCity.map(x => x.currentInfections / x.interest.numberOfHabitants * 100000);
  const increasedInfectionsSinceYesterdayPer100000 = data.stats.infectionsPerCity.map(x => x.increasedInfectionsSinceYesterday / x.interest.numberOfHabitants * 100000);

  Highcharts.chart('chart-seven-days-incidence', {
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
      yAxis: {
          min: 0,
          title: {
            text: 'Wert'
          }
      },
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
          name: '7-Tages-Inzindenz',
          data: sevenDayPer100000
      }, {
          name: 'Gesamte Infektionen',
          data: totalInfections
      }, {
          name: 'Aktuell Infizierte',
          data: currentInfections
      }, {
        name: 'Neuinfektionen',
        data: increasedInfectionsSinceYesterday
    }, {
        name: 'Gesamte Infektionen pro 100.000 Einwohner',
        data: totalInfectionsPer100000,
        visible: false
    }, {
        name: 'Aktuell Infizierte pro 100.000 Einwohner',
        data: currentInfectionsPer100000,
        visible: false
    }, {
        name: 'Neuinfektionen pro 100.000 Einwohner',
        data: increasedInfectionsSinceYesterdayPer100000,
        visible: false
    }]
  });
});