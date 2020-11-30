registerChart('chart-overview', async chartLink => {
  const response = await fetch('/api');
  const data = await response.json();

  const days = data.rnkData.map(x => new Date(x.date).toLocaleDateString());

  const currentInfectionsSeries = {
    name: 'Aktuelle Infektionen (RNK)',
    type: 'column',
    yAxis: 0,
    data: []
  };

  const increasedInfectionsSinceYesterdaySeries = {
    name: 'Neuinfektionen (RNK)',
    type: 'column',
    yAxis: 0,
    data: []
  };

  const totalInfectionsSeries = {
    name: 'Gesamte Infektionen (RNK)',
    type: 'spline',
    yAxis: 1,
    data: []
  };

  const increasedInfectionsForSevenDaysSeries = {
    name: '7-Tage-Inzidenz (RNK)',
    type: 'spline',
    yAxis: 2,
    data: [],
    tooltip: {
      valueDecimals: 1
    }
  };

  const rValueSeries = {
    name: 'R-Wert (RNK)',
    type: 'spline',
    yAxis: 6,
    data: [],
    tooltip: {
      valueDecimals: 2
    },
    visible: false,
  };

  const airSeries = {
    name: 'Feinstaub (RNK)',
    type: 'spline',
    yAxis: 3,
    data: [],
    tooltip: {
      valueSuffix: '  µg/m³',
      valueDecimals: 2
    },
    visible: false,
  };

  const worldwideCurrentInfectionSeries = {
    name: 'Aktuelle Infektionen (weltweit)',
    type: 'column',
    yAxis: 4,
    data: [],
    visible: false,
  };

  const worldwideTotalInfectionSeries = {
    name: 'Gesamte Infektionen (weltweit)',
    type: 'spline',
    yAxis: 5,
    data: [],
    visible: false,
  };

  const worldwideIncreasedInfectionsForSevenDaysSeries = {
    name: '7-Tage-Inzidenz (weltweit)',
    type: 'spline',
    yAxis: 2,
    data: [],
    visible: false,
    tooltip: {
      valueDecimals: 1
    }
  };

  data.stats.globalPerDay.map(day => {
    currentInfectionsSeries.data.push(day.currentInfections);
    increasedInfectionsSinceYesterdaySeries.data.push(day.increasedInfectionsSinceYesterday);
    totalInfectionsSeries.data.push(day.totalInfections);
    increasedInfectionsForSevenDaysSeries.data.push(day.increasedInfectionsForSevenDays);
    rValueSeries.data.push(day.rValue);
    airSeries.data.push(day.airDataAverage);
    worldwideCurrentInfectionSeries.data.push(day.worldwideCurrentInfections);
    worldwideTotalInfectionSeries.data.push(day.worldwideTotalInfections);
    worldwideIncreasedInfectionsForSevenDaysSeries.data.push(day.worldwideIncreasedInfectionsForSevenDays);
  });

  const series = [
    currentInfectionsSeries,
    increasedInfectionsSinceYesterdaySeries,
    totalInfectionsSeries,
    increasedInfectionsForSevenDaysSeries,
    rValueSeries,
    airSeries,
    worldwideCurrentInfectionSeries,
    worldwideTotalInfectionSeries,
    worldwideIncreasedInfectionsForSevenDaysSeries
  ];

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
      categories: days,
      labels: {
        useHTML: true,
        formatter: function() {
            const date = new Date(this.value);
            const weekday = date.getDay();
            const weekendColor = weekday === 0 || weekday === 6 ? 'color: #BBB' : '';
            
            return `<span style="${weekendColor}">${this.value}</span>`;
        }
    }
    },
    yAxis: [{
      title: {
        text: 'Aktuelle Infektionen und Neuinfektionen',
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
          color: Highcharts.getOptions().colors[2]
        }
      },
      labels: {
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      },
      opposite: true
    }, {
      title: {
        text: '7-Tage-Inzidenz',
        style: {
          color: Highcharts.getOptions().colors[3]
        }
      },
      labels: {
        style: {
          color: Highcharts.getOptions().colors[3]
        }
      },
    }, {
      visible: false
    }, {
      visible: false
    }, {
      visible: false
    }, {
      visible: false
    }],
    tooltip: {
      shared: true
    },
    series: series
  });
});