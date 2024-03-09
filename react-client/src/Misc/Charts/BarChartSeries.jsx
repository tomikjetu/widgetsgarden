import Chart from "react-apexcharts";
import { TimeSettings } from "../../Pages/Dashboard";
import { useEffect, useState } from "react";

export default function BarChartSeries({ title, id, setTimespan, timespan, startDate, endDate, source, noData }) {

  const [chartData, setChartData] = useState([]);
  const [axisCategories, setAxisCategories] = useState([]);
  const [maxValue, setMaxValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  var [availableCategories, setAvailableCategories] = useState([]);
  var [selectedCategories, setSelectedCategories] = useState(null);

  useEffect(() => {
    if (!source) return;

    var timeSelectedData = {}; // Has only values within the selected time range
    var realData = {}; // Has no zero values or empty categories
    var tempChartData = []; // Data sent to the chart api

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

    // Reduce all values into a single object
    // Remove unselected categories
    // Remove series with no data
    // Remove categories with zero series sum
    Object.keys(timeSelectedData).forEach((category) => {
      if (!selectedCategories?.includes(category)) return;
      realData[category] = {};
      var sum = 0;
      Object.keys(timeSelectedData[category]).forEach((series) => {
        var value = Object.values(timeSelectedData[category][series] ?? []).reduce((a, b) => a + b, 0);
        if (value == 0) return;
        realData[category][series] = value;
        sum += value;
      });
      if (sum == 0) delete realData[category];
    });

    setAxisCategories(Object.keys(realData));
    if (selectedCategories == null) setSelectedCategories(Object.keys(timeSelectedData));
    setAvailableCategories(Object.keys(timeSelectedData));

    // Create data for each category
    var tempSeries = {};
    availableCategories.filter((category) => selectedCategories?.includes(category)).forEach((category, i) => {
      Object.keys(realData[category]).forEach((series) => {
        if (!tempSeries[series]) tempSeries[series] = [];
        tempSeries[series][i] = realData[category][series];
      });
    });

    Object.keys(tempSeries).forEach((series) => {
      tempChartData.push({ name: series, data: tempSeries[series] });
    });

    setChartData(tempChartData);

    // Find the maximum value, and total value
    var tempMaxValue = 0;
    var tempTotalValue = 0;
    Object.keys(realData).forEach(function (category, index) {
      Object.keys(realData[category]).forEach((series) => {
        tempMaxValue = Math.max(tempMaxValue, realData[category][series]);
        tempTotalValue += realData[category][series];
      })
    })

    setMaxValue(tempMaxValue);
    setTotalValue(tempTotalValue);

  }, [startDate, endDate, source, selectedCategories]);

  var options = {
    chart: {
      id,
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
      categories: axisCategories,
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

  if (!source) return noData;

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
        <Chart options={options} series={chartData} type="bar" width={"100%"} height={"100%"} />
      </div>

      <div className="analytics-list">
        {availableCategories.map((availableCategory, index) => {
          var selectedOpacity = selectedCategories.includes(availableCategory) ? 1 : 0.5;
          return (
            <div
              key={availableCategory}
              className="analytics-list-item"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                if (selectedCategories.includes(availableCategory)) setSelectedCategories(selectedCategories.filter((s) => s != availableCategory));
                else setSelectedCategories([...selectedCategories, availableCategory]);
              }}
            >
              <p style={{ opacity: selectedOpacity }}>{availableCategory}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
