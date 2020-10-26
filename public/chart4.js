registerChart('chart4', async chartLink => {
   const response = await fetch('/api');
   const data = await response.json();

   const stats = data.stats.infectionsPerCity.map(x => ({
        name: x.interest.city,
        ...x.interest.coords,
        z: x.totalInfections,
        currentInfections: x.currentInfections,
        numberOfHabitants: x.interest.numberOfHabitants,
        squareKilometers: x.interest.squareKilometers
    }));

    var states = [{
        id: 'de-bw-08226000',
        name: 'Rhein-Neckar-Kreis'
    }];

  Highcharts.mapChart('chart4', {
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
        tooltip: {
            pointFormat: '{point.name} - Anzahl Infektionen: {point.z}'
        },
        dataLabels: {
            enabled: true,
            format: '{point.name}'
        },
    }]
  });
});