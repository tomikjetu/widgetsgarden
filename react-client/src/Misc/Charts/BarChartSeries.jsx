import Chart from "react-apexcharts";
import { TimeSettings } from "../../Pages/Dashboard";
import { useEffect, useState } from "react";

export default function BarChartSeries({ title, id, setTimespan, timespan, startDate, endDate, source, noData }) {
  //   COLOR SET

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maxValue, setMaxValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  var [series, setSeries] = useState([]);
  var [selectedSeries, setSelectedSeries] = useState([]);

  useEffect(() => {
    if (!source) return;

    var entries = {};
    var tempData = {};

    // ONE SERIES CAN HAVE VALUES FROM MULTIPLE CATEGORIES

    // Filter the data to only include entries in the selected time range
    Object.keys(source).forEach((series) => {
      Object.keys(source[series]).forEach((category) => {
        if (!entries[series]) entries[series] = {};
        entries[series][category] = Object.fromEntries(
          Object.entries(source[series][category]).filter(([key]) => {
            var current = new Date(key).getTime();
            return current >= startDate && current <= endDate;
          })
        );
      });
    });

    // Reduce all values into a single object
    Object.keys(entries).forEach((series) => {
      Object.keys(entries[series]).forEach((category) => {
        if (!tempData[series]) tempData[series] = {};
        tempData[series][category] = Object.values(entries[series][category] ?? []).reduce((a, b) => a + b, 0);
      });
    });

    // Find the maximum value, and total value
    var tempMaxValue = 0;
    var tempTotalValue = 0;
    Object.keys(tempData).forEach(function (series, index) {
      Object.keys(tempData[series]).forEach((category) => {
        if (tempData[series][category] > tempMaxValue) tempMaxValue = tempData[series][category];
        tempTotalValue += tempData[series][category];
      });
    });

    // Create data for each category
    var tempCategories = [];
    Object.keys(tempData).forEach(function (series, index) {
      Object.keys(tempData[series]).forEach((category) => {
        if (!tempCategories.includes(category)) tempCategories.push(category);
      });
    });

    var tempValues = {};

    // Add data for each series
    Object.keys(tempData).forEach(function (series, index) {
      if (!tempValues[series]) tempValues[series] = [];
      tempCategories.forEach((category) => {
        tempValues[series].push(tempData[series][category] ?? 0);
      });
    });

    var finalData = [];
    var tempSeries = [];
    Object.keys(tempValues).forEach(function (series, index) {
      tempSeries.push(series);
      finalData.push({
        name: series,
        data: tempValues[series],
      });
    });

    // Remove empty categories and their values from the data
    // This prevents empty bars from appearing on the chart
    for (var i = tempCategories.length - 1; i >= 0; i--) {
      var sum = 0;
      finalData.forEach((series) => {
        sum += series.data[i];
      });
      if (sum == 0) {
        tempCategories.splice(i, 1);
        finalData.forEach((series) => {
          series.data.splice(i, 1);
        });
      }
    }

    setSeries(tempSeries);

    //  TODO only when length changes
    setSelectedSeries(tempSeries);

    setCategories(tempCategories);
    setData(finalData);

    setMaxValue(tempMaxValue);
    setTotalValue(tempTotalValue);
  }, [startDate, endDate, source]);

  var options = {
    chart: {
      id,
      toolbar: {
        tools: {
          download: false,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: categories,
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
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <TimeSettings transparent timespan={timespan} setTimespan={setTimespan} />
          <p>Hide X axis</p>
        </div>
      </div>

      <div className="chart-container">
        <Chart options={options} series={data} type="bar" width={"100%"} height={"100%"} />
      </div>

      <div className="analytics-list">
        {series.map((ser, index) => {
          var selectedOpacity = selectedSeries.includes(ser) ? 1 : 0.5;
          return (
            <div
              key={ser}
              className="analytics-list-item"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                if (selectedSeries.includes(ser)) setSelectedSeries(selectedSeries.filter((s) => s != ser));
                else setSelectedSeries([...selectedSeries, ser]);
              }}
            >
              <div
                style={{
                  width: "1rem",
                  aspectRatio: 1,
                  marginRight: "0.5rem",
                  borderRadius: "25%",

                  backgroundColor: `#${Math.random().toString(16).slice(2, 8)}`,
                  opacity: selectedOpacity
                }}
              />
              <p style={{opacity: selectedOpacity}}>
                {ser}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
