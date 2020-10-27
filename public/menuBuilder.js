const chartLinks = [
  { chartName: '7-Tages-Inzidenz, Gesamte Infektionen, Aktuell Infizierte', containerId: 'chart1' }, 
  { chartName: 'Verlauf Aktuelle Infektionen', containerId: 'chart2' },
  { chartName: 'Verhältnis Infektionen zu Bevölkerungsdichte', containerId: 'chart3' },
  { chartName: 'Karte: Gesamte Infektionen', containerId: 'chart4' },
  { chartName: 'Karte: 7-Tage-Inzidenz', containerId: 'chart5' },
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
      const loadingMessage = document.getElementById('loadingMessage');
      loadingMessage.innerHTML = 'Chart wird geladen...';

      document.getElementById('chartIsLoading').style.display = 'block';
      
      const timeout = setTimeout(() => loadingMessage.innerHTML = 'Das Chart lädt immer noch. Wenn die Daten das erste Mal abgerufen werden kann es etwas länger dauern. Wir haben es fast geschafft...', 3000);

      await chartRegistration.onLoad(chartLink);
      document.getElementById('chartIsLoading').style.display = 'none';
      chartRegistration.isLoaded = true;
      clearTimeout(timeout);
    }
  };

  hideAllCharts();
  activateChart(chartLinks[0]);
};

const loadLatestDataAt = async () => {
  const response = await fetch('/api');
  const data = await response.json();

  document.getElementById('latestDataAt').innerHTML = new Date(data.stats.latestDataAt).toLocaleDateString();
};

(async function() {
  buildChartsMenu();
  await loadLatestDataAt();
})();