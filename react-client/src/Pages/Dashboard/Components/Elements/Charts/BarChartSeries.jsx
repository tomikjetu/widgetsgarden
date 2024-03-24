import Chart from "react-apexcharts";
import { TimeSettings } from "../../../../Dashboard.jsx";
import { useEffect, useState } from "react";
import { BarChartOptions } from "./Options/BarChartOptions.jsx";
import { SelectableAnalytic } from "../Analytic.jsx";

export default function BarChartSeries({ title, id, setTimespan, timespan, startDate, endDate, source, noData, labels }) {
  const [chartData, setChartData] = useState([]);
  const [axisCategories, setAxisCategories] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  var [availableCategories, setAvailableCategories] = useState([]);
  var [availableCategoriesTotals, setAvailableCategoriesTotals] = useState([]);
  var [selectedCategories, setSelectedCategories] = useState(null);

  useEffect(() => {
    if (!source) return;

    var timeSelectedData = {}; // Has only values within the selected time range
    var realData = {}; // Has no zero values or empty categories
    var tempChartData = []; // Data sent to the chart api

    var tempTotalValue = 0;
    var tempCategoryTotals = {};
    var tempAvailableCategories = [];


    // Filter the data to only include entries in the selected time range
    Object.keys(source).forEach((category) => {
      timeSelectedData[category] = {};
      Object.keys(source[category]).forEach((series) => {
        timeSelectedData[category][series] = Object.fromEntries(
          Object.entries(source[category][series]).filter(([key]) => {
            var current = new Date(key).getTime();
            return current >= startDate && current <= endDate;
          })
        );
      });
    });



    // Remove series with no data
    Object.keys(timeSelectedData).forEach((category) => {
      var sum = 0;
      Object.keys(timeSelectedData[category]).forEach((series) => {
        var value = Object.values(timeSelectedData[category][series] ?? []).reduce((a, b) => a + b, 0);
        sum += value;
      });
      if (sum == 0) delete timeSelectedData[category];
    });

    // Reduce all values into a single object
    // Remove unselected categories
    // Remove categories with zero series sum
    Object.keys(timeSelectedData).forEach((category) => {
      if (!selectedCategories?.includes(category)) return;
      realData[category] = {};
      if (!tempCategoryTotals[category]) tempCategoryTotals[category] = 0;
      Object.keys(timeSelectedData[category]).forEach((series) => {
        var value = Object.values(timeSelectedData[category][series] ?? []).reduce((a, b) => a + b, 0);
        tempCategoryTotals[category] += value; // Find the total value of each category
        if (value == 0) return;
        realData[category][series] = value;
      });
    });


    tempAvailableCategories = Object.keys(timeSelectedData).map((value) => ({ label: labels ? labels[Object.keys(timeSelectedData).indexOf(value)] ?? value : value, value }));

    // Create data for each category
    var tempSeries = {};
    tempAvailableCategories
      .filter((category) => selectedCategories?.includes(category.value))
            .forEach((category, i) => {
        Object.keys(realData[category.value]).forEach((series) => {
          if (!tempSeries[series]) tempSeries[series] = [];
          tempSeries[series][i] = realData[category.value][series];
        });
      });

    Object.keys(tempSeries).forEach((series) => {
      tempChartData.push({ name: series, data: tempSeries[series] });
    });

    // Find the total value
    Object.keys(realData).forEach(function (category, index) {
      Object.keys(realData[category]).forEach((series) => {
        tempTotalValue += realData[category][series];
      });
    });

    setAxisCategories(Object.keys(realData));
    if (selectedCategories == null) setSelectedCategories(Object.keys(timeSelectedData));
    setAvailableCategories(tempAvailableCategories);

    setChartData(tempChartData);

    setTotalValue(tempTotalValue);
    setAvailableCategoriesTotals(tempCategoryTotals);
  }, [startDate, endDate, source, selectedCategories]);


  if (!source)
    return (
      <div className="dashboard-container analytics">
        <p>{noData}</p>
      </div>
    );

  return (
    <div className="dashboard-container analytics">
      <div className="analytics-container">
        <div className="analytics-stats">
          <h2 className="analytics-title">{title}</h2>
          <p className="analytics-main-value">{totalValue}</p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <TimeSettings transparent timespan={timespan} setTimespan={setTimespan} />
        </div>
      </div>

      <div className="chart-container">
        <Chart
          options={{
            ...BarChartOptions,
            chart: {
              ...BarChartOptions.chart,
              id,
            },
            xaxis: {
              ...BarChartOptions.xaxis,
              categories: axisCategories,
            },
          }}
          series={chartData}
          type="bar"
          width={"100%"}
          height={"100%"}
        />
      </div>

      <SelectableAnalytic collections={availableCategories} selectedAnalytics={selectedCategories} setSelectedAnalytics={setSelectedCategories} collectionsValues={availableCategoriesTotals} />
    </div>
  );
}
