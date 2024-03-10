import Chart from "react-apexcharts";
import { TimeSettings } from "../../Pages/Dashboard.jsx";
import { useEffect, useState } from "react";
import { LineChartOptions } from "./Options/LineChartOptions.jsx";

export default function TimeLineSeries({ title, id, setTimespan, timespan, startDate, endDate, source, noData }) {
  const [data, setData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!source) return;

    var entries = {};
    var tempData = [];

    var tempTotalValue = 0;

    // Filter the data to only include entries in the selected time range
    Object.keys(source).forEach((series) => {
      entries[series] = Object.fromEntries(
        Object.entries(source[series]).filter(([key]) => {
          var current = new Date(key).getTime();
          return current >= startDate && current <= endDate;
        })
      );
    });

    // Add data for each category
    Object.keys(entries).forEach((series) => {
      var data = [];

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        var value = entries[series][`${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`] ?? 0
        data.push({
          x: `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
          y: value
        });
        tempTotalValue  += value;

        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      tempData.push({
        name: series,
        data
      });
    });
    
    setData(tempData);
    setTotalValue(tempTotalValue);
  }, [startDate, endDate, source]);

  return (
    <div className="dashboard-container analytics">
      <div className="analytics-container">
        <div className="analytics-stats">
          <h2 className="analytics-title">{title}</h2>
          <p className="analytics-main-value">{totalValue}</p>
        </div>
        <TimeSettings transparent timespan={timespan} setTimespan={setTimespan} />
      </div>

      <div className="chart-container">
        <Chart
          options={{
            ...LineChartOptions,
            chart: {
              ...LineChartOptions.chart,
              id,
            },
            xaxis: {
              ...LineChartOptions.xaxis,
              type: "datetime",
            },
          }}
          series={data}
          type="line"
          width={"100%"}
          height={"100%"}
        />
      </div>
    </div>
  );
}
