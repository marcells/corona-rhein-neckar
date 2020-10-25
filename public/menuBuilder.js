const chartLinks = [
  { chartName: '7-Tages-Inzidenz, Gesamte Infektionen, Aktuell Infizierte', containerId: 'chart1' }, 
  { chartName: 'Verlauf Infektionen', containerId: 'chart2' },
  { chartName: 'Verhältnis Infektionen zu Bevölkerungsdichte', containerId: 'chart3' }
];

const buildChartsMenu = () => {
  const chartsContainer = document.querySelector('figure.highcharts-figure');
  const chartLinksElement = document.getElementById('chartLinks');
  const chartLinksElements = chartLinks.map(x => {
    const liElement = document.createElement('li');
    const aElement = document.createElement('a');
    aElement.innerText = x.chartName;
    aElement.href = '#';
    aElement.onclick = () => activateChart(x);

    liElement.appendChild(aElement);
    return liElement;
  });

  chartLinks.forEach(chartLink => {
    const chartContainer = document.createElement('div');
    chartContainer.id = chartLink.containerId;

    chartsContainer.appendChild(chartContainer);
  });
  chartLinksElements.forEach(element => chartLinksElement.appendChild(element));

  const hideAllCharts = () => chartLinks.forEach(chartLink => document.getElementById(chartLink.containerId).style.display = 'none');

  const activateChart = async chartLink => {
    hideAllCharts();

    const chartRegistration = charts[chartLink.containerId];

    document.getElementById(chartLink.containerId).style.display = 'block';

    if (chartRegistration.isLoaded === false) {
      document.getElementById('chartIsLoading').style.display = 'block';
      await chartRegistration.onLoad(chartLink);
      document.getElementById('chartIsLoading').style.display = 'none';
      chartRegistration.isLoaded = true;
    }
  };

  hideAllCharts();
  activateChart(chartLinks[0]);
};

(async function() {
  buildChartsMenu();
})();