const charts = {};

const registerChart = (containerId, onLoad) => {
  charts[containerId] = {
    onLoad,
    isLoaded: false
  };
};