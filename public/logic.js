(async function() {
    const response = await fetch('/api');
    const data = await response.json();

    const cities = data.stats.infectionsPerCity.map(x => `${x.interest.city} (${x.interest.numberOfHabitants})`);
    const sevenDayPer100000 = data.stats.infectionsPerCity.map(x => x.sevenDayPer100000);
    const totalInfections = data.stats.infectionsPerCity.map(x => x.totalInfections);
    const currentInfections = data.stats.infectionsPerCity.map(x => x.currentInfections);

    Highcharts.chart('container', {
        chart: {
          type: 'column',
          height: 800,
        },
        title: {
          text: 'Corona Rhein-Neckar'
        },
        subtitle: {
          text: 'rhein-neckar-kreis.de'
        },
        xAxis: {
          categories: cities,
          crosshair: true
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Wert'
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
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

      Highcharts.chart('container2', {
        chart: {
            type: 'line',
            height: 800,
        },
        title: {
            text: 'Aktuelle Infektionen'
        },
        subtitle: {
            text: 'rhein-neckar-kreis.de'
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