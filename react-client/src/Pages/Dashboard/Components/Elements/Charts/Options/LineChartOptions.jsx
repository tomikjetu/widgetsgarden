export const LineChartOptions = {
  chart: {
    // ID
    toolbar: {
      tools: {
        download: false,
      },
    },
  },
  tooltip: {
    enabled: true,
    shared: true,
    intersect: false,
    theme: "dark",
  },
  legend: {
    show: false,
  },
  xaxis: {
    // CATEGORIES
    labels: {
      hideOverlappingLabels: true,
      style: {
        colors: "#fff",
        fontFamily: "Raleway, sans-serif",
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: "#fff",
        fontFamily: "Raleway, sans-serif",
      },
    },
  },
};
