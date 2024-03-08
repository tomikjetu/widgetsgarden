import Chart from "react-apexcharts";
import { TimeSettings } from "../../Pages/Dashboard";
import { useEffect, useState } from "react";

export default function LineChart({ title, id, setTimespan, timespan, startDate, endDate, source, noData }) {
  //   COLOR SET
  
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maxValue, setMaxValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!source) return;

    var entries = {};
    var tempData = {};

    console.log(source);

    Object.keys(source).forEach((entry) => {
      entries[entry] = Object.fromEntries(
        Object.entries(source[entry]).filter(([key]) => {
          var current = new Date(key).getTime();
          if (current >= startDate && current <= endDate) return true;
        })
      );
    });

    console.log(entries);

    tempData = Object.keys(entries).map(function (key, index) {
     return Object.values(entries[key] ?? []).reduce((a, b) => a + b, 0);
    })
    console.log(tempData);

    var tempMaxValue = 0;
    var tempTotalValue = 0;
    Object.keys(tempData).forEach(function (key, index) {
      if (tempData[key] > tempMaxValue) tempMaxValue = tempData[key];
      tempTotalValue += tempData[key];
    });

    setData(tempData);
    setMaxValue(tempMaxValue);
    setTotalValue(tempTotalValue);
  }, [startDate, endDate, source]);


  var [options] = useState({
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
  });

  var [series] = useState([
    {
      name: "Visits",
      data: data,
    },
  ]);

  if (!source) return noData;

  return (
    <div className="dashboard-container analytics">
      <div className="analytics-container">
        <div className="analytics-stats">
          <h2 className="analytics-title">{title}</h2>
        </div>
        <TimeSettings transparent timespan={timespan} setTimespan={setTimespan} />
      </div>

      <Chart options={options} series={series} type="bar" width={"100%"} height={"100%"} />
    </div>
  );
}
