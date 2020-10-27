registerChart('chart5', async chartLink => {
   const response = await fetch('/api');
   const data = await response.json();

   const stats = data.stats.infectionsPerCity.map(x => ({
        name: x.interest.city,
        ...x.interest.coords,
        z: x.sevenDayPer100000,
        sevenDayPer100000: x.sevenDayPer100000,
        totalInfections: x.totalInfections,
        currentInfections: x.currentInfections,
        numberOfHabitantsPerSquareKilometer: x.interest.numberOfHabitants / x.interest.squareKilometers,
        numberOfHabitants: x.interest.numberOfHabitants,
        squareKilometers: x.interest.squareKilometers
    }));

    var states = [{
        id: 'de-bw-08226000',
        name: 'Rhein-Neckar-Kreis'
    }];

  Highcharts.mapChart('chart5', {
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
            '<tr><th>7-Tage-Inzidenz:</th><td>{point.sevenDayPer100000:.1f}</td></tr>' +
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
        data: stats,
        type: 'mapbubble',
        name: 'Cities',
        dataLabels: {
            enabled: true,
            format: '{point.name}'
        },
    }]
  });
});