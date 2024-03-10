import Chart from "react-apexcharts";
import { TimeSettings } from "../../Pages/Dashboard.jsx";
import { useEffect, useState } from "react";
import { LineChartOptions } from "./Options/LineChartOptions.jsx";

export default function TimeLineSeries({ title, id, setTimespan, timespan, startDate, endDate, source, noData, colorSet }) {
  const [data, setData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  var [availableSeries, setAvailableSeries] = useState([]);
  var [availableSeriesTotals, setAvailableSeriesTotals] = useState([]);
  var [selectedSeries, setSelectedSeries] = useState(null);


  useEffect(() => {
    if (!source) return;

    var timeSelectedData = {};
    var tempData = [];

    var tempTotalValue = 0;
    var tempSeriesTotal = {};

    // Filter the data to only include entries in the selected time range
    Object.keys(source).forEach((series) => {
      timeSelectedData[series] = Object.fromEntries(
        Object.entries(source[series]).filter(([key]) => {
          var current = new Date(key).getTime();
          return current >= startDate && current <= endDate;
        })
      );
    });

    // Add data for each category
    Object.keys(timeSelectedData).forEach((series) => {
      var data = [];

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        var value = timeSelectedData[series][`${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`] ?? 0;
        data.push({
          x: `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
          y: value,
        });
        tempSeriesTotal[series] = (tempSeriesTotal[series] ?? 0) + value;
        tempTotalValue += value;

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (!selectedSeries?.includes(series)) return;

      tempData.push({
        name: series,
        data,
      });
    });

    if (selectedSeries == null) setSelectedSeries(Object.keys(timeSelectedData));
    setAvailableSeries(Object.keys(timeSelectedData))

    setData(tempData);
    setTotalValue(tempTotalValue);
    setAvailableSeriesTotals(tempSeriesTotal);
  }, [startDate, endDate, source, selectedSeries]);

  if (!source) return noData;

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
            colors: colorSet,
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

      <div className="analytics-list">
        {availableSeries.map((availableSerie, index) => {
          var selectedOpacity = selectedSeries.includes(availableSerie) ? 1 : 0.5;
          return (
            <div
              key={availableSerie}
              className="analytics-list-item"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                if (selectedSeries.includes(availableSerie)) setSelectedSeries(selectedSeries.filter((s) => s != availableSerie));
                else setSelectedSeries([...selectedSeries, availableSerie]);
              }}
            >
              <p style={{ opacity: selectedOpacity, width: "100%", display: "flex", justifyContent: "space-between" }}>
                <span>{availableSerie}</span>
                <span>{availableSeriesTotals[availableSerie]}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
