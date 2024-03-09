import Chart from "react-apexcharts";
import { TimeSettings } from "../../Pages/Dashboard";
import { useEffect, useState } from "react";

export var options = {
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

export default function BarChart({ title, id, setTimespan, timespan, startDate, endDate, source, noData }) {

  const [data, setData] = useState([]);
  const [axisCategories, setAxisCategories] = useState([]);
  const [maxValue, setMaxValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!source) return;

    var entries = {};
    var tempData = {};

    // Filter the data to only include entries in the selected time range
    Object.keys(source).forEach((category) => {
      entries[category] = Object.fromEntries(
        Object.entries(source[category]).filter(([key]) => {
          var current = new Date(key).getTime();
          return current >= startDate && current <= endDate;
        })
      );
    });

    // Add data for each category
    Object.keys(entries).forEach((category) => {
      tempData[category] = Object.values(entries[category] ?? []).reduce((a, b) => a + b, 0);
    });

    // Find the maximum value, and total value
    var tempMaxValue = 0;
    var tempTotalValue = 0;
    Object.keys(tempData).forEach((category) => {
      if (tempData[category] > tempMaxValue) tempMaxValue = tempData[category];
      tempTotalValue += tempData[category];
    });

    var finalData = [];
    var tempValues = [];

    // Remove categories with no data
    Object.entries(tempData).forEach(([category, value]) => value === 0 && delete tempData[category]);
    
    // Add data for each series
    Object.entries(tempData).forEach(([series, value]) => tempValues.push(value));
    finalData.push({
      name: "Visits",
      data: tempValues,
    });

    setAxisCategories(Object.keys(tempData));
    setData(finalData);

    setMaxValue(tempMaxValue);
    setTotalValue(tempTotalValue);
  }, [startDate, endDate, source]);

  if (!source) return noData;

  return (
    <div className="dashboard-container analytics">
      <div className="analytics-container">
        <div className="analytics-stats">
          <h2 className="analytics-title">{title}</h2>
        </div>
        <TimeSettings transparent timespan={timespan} setTimespan={setTimespan} />
      </div>

      <div className="chart-container">
        <Chart options={{
          ...options,
          chart: {
            ...options.chart,
            id
          },
          xaxis: {
            ...options.xaxis,
            categories: axisCategories
          }
        }} series={data} type="bar" width={"100%"} height={"100%"} />
      </div>
    </div>
  );
}
