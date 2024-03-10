export const BarChartOptions = {
  chart: {
    // ID
    stacked: true,
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
