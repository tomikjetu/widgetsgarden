import Chart from "react-apexcharts";
import { TimeSettings } from "../../../../Dashboard.jsx";
import { useEffect, useState } from "react";

import { LineChartOptions } from "./Options/LineChartOptions.jsx";

export default function TimeLine({ title, id, setTimespan, timespan, startDate, endDate, source, noData }) {
  const [data, setData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (!source) return;

    var entries = {};
    var tempData = [];

    // Filter the data to only include entries in the selected time range
    Object.keys(source).forEach((time) => {
      var current = new Date(time).getTime();
      if (current >= startDate && current <= endDate) entries[time] = source[time];
    });

    var tempTotalValue = 0;

    var data = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      var value = entries[`${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`] ?? 0;
      data.push({
        x: `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
        y: value,
      });
      tempTotalValue += value;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    tempData.push({
      name: "Loads",
      data,
    });
    setData(tempData);

    setTotalValue(tempTotalValue);
  }, [startDate, endDate, source]);

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
