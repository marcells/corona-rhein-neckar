registerChart('chart-map-history', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const cities = data.stats.infectionsPerCity.map(x => x.interest);
  const days = data.rnkData.map(x => new Date(x.date));

  const series = data.rnkData
    .map((day, _) => {
      const data = day.additionalData.map(row => {
        const city = cities.find(x => x.city == row.city);

        return {
          name: city.city,
          ...city.coords,
          z: row.currentInfections,
          currentInfections: row.currentInfections,
          totalInfections: row.totalInfections,
          numberOfHabitantsPerSquareKilometer: city.numberOfHabitants / city.squareKilometers,
          numberOfHabitants: city.numberOfHabitants,
          squareKilometers: city.squareKilometers
        };
      });

      return {
        date: new Date(day.date),
        data
      }
    })
    .reduce((map, obj) => {
      map[obj.date] = obj.data;
      return map;
    }, {});

  var states = [{
    id: 'de-bw-08226000',
    name: 'Rhein-Neckar-Kreis'
  }];

  const chart = Highcharts.mapChart('chart-map-history', {
    chart: {
      height: 800,
      events: {
        load: function () {
          const val = this.get('de-bw-08226000');
          console.log(val);
          val.zoomTo();
        }
      }
    },
    legend: {
      enabled: false
    },
    title: {
      text: chartLink.chartName
    },
    subtitle: {
      text: 'Quelle: rhein-neckar-kreis.de with map <a href="http://code.highcharts.com/mapdata/countries/de/de-all-all.js">Germany, admin2</a>'
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    tooltip: {
      useHTML: true,
      headerFormat: '<table>',
      pointFormat: '<tr><th colspan="2"><h3>{point.name}</h3></th></tr>' +
        '<tr><th>Gesamte Infektionen:</th><td>{point.totalInfections}</td></tr>' +
        '<tr><th>Aktuelle Infektionen:</th><td>{point.currentInfections}</td></tr>' +
        '<tr><th>Einwohner pro km²:</th><td>{point.numberOfHabitantsPerSquareKilometer:.1f} Einwohner</td></tr>' +
        '<tr><th>Einwohner:</th><td>{point.numberOfHabitants} Einwohner</td></tr>' +
        '<tr><th>Fläche:</th><td>{point.squareKilometers:.1f} km²</td></tr>',
      footerFormat: '</table>',
      followPointer: false
    },
    series: [{
      data: states,
      name: 'BaseMap',
      mapData: Highcharts.maps['countries/de/de-all-all'],
      enableMouseTracking: false,
      joinBy: ['hc-key', 'id'],
      dataLabels: {
        enabled: false,
        format: '{point.name}'
      },
    }, {
      data: [],
      type: 'mapbubble',
      name: 'Cities',
      dataLabels: {
        enabled: true,
        format: '{point.name}'
      },
    }]
  });

  let dayIndex = 0;

  setInterval(() => {
    const currentDay = days[dayIndex];
    const data = series[currentDay];

    chart.series[1].setData(data);
    chart.setTitle({ text: `${chartLink.chartName}: ${currentDay.toLocaleDateString()}` });

    dayIndex++;

    if (dayIndex > days.length - 1) {
      dayIndex = 0;
    }
  }, 750);
});