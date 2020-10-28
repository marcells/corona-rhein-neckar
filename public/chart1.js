registerChart('chart1', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const cities = data.stats.infectionsPerCity.map(x => x.interest);
  const sevenDayPer100000 = data.stats.infectionsPerCity.map(x => x.sevenDayPer100000);
  const totalInfections = data.stats.infectionsPerCity.map(x => x.totalInfections);
  const currentInfections = data.stats.infectionsPerCity.map(x => x.currentInfections);

  Highcharts.chart('chart1', {
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
      }]
  });
});