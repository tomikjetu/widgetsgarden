import { useEffect, useRef, useState } from "react";
import h337 from "heatmap.js";

export default function ClickHeatMap({ id, source, noData, title, imgSource, startDate, endDate }) {
  var ref = useRef(null);
  var [totalValue, setTotalValue] = useState(0);
  var [maxValue, setMaxvalue] = useState(0);

  var [isImgLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, imgSource);

  var [heatMapData, setHeatMapData] = useState(null);

  useEffect(() => {
    console.log(!heatMapData, !isImgLoaded);
    if (!heatMapData || !isImgLoaded) return;


    Object.values(document.getElementsByClassName("heatmap-canvas")).forEach((element) => element.remove());

    var heatmap = h337.create({
      container: ref.current,
    });
    heatmap.setData({
      data: heatMapData,
      max: maxValue
    });
  }, [heatMapData, isImgLoaded]);

  useEffect(() => {
    if (!source) return;

    var entries = {}; // Has only values within the selected time range
    var tempData = {};
    Object.keys(source).forEach((entry) => {
      entries[entry] = Object.fromEntries(
        Object.entries(source[entry]).filter(([key]) => {
          var current = new Date(key).getTime();
          return current >= startDate && current <= endDate;
        })
      );
    });

    Object.keys(entries).forEach(function (key, index) {
      tempData[key] = Object.values(entries[key] ?? []).reduce((a, b) => a + b, 0);
    });

    var tempMaxValue = 0;
    var tempTotalValue = 0;
    Object.keys(tempData).forEach(function (key, index) {
      if (tempData[key] > tempMaxValue) tempMaxValue = tempData[key];
      tempTotalValue += tempData[key];
    });

    var heatData = [];
    Object.keys(tempData).forEach((key) => {
      var coords = key.split(":");
      if (tempData[key] > 0) heatData.push({ x: coords[0], y: coords[1], value: tempData[key] });
    });
    setHeatMapData(heatData);

    setTotalValue(tempTotalValue);
    setMaxvalue(tempMaxValue);
  }, [startDate, endDate, source]);

  if (!source)
    return (
      <div className="dashboard-container analytics" key={id}>
        <div className="analytics-stats">
          <h2 className="analytics-title">{title}</h2>
          <p className="analytics-main-value">{noData}</p>
        </div>
      </div>
    );

  return (
    <div style={{overflowX: 'auto'}} className="dashboard-container analytics" key={id}>
      <div className="analytics-stats">
        <h2 className="analytics-title">{title}</h2>
        <p className="analytics-main-value">{totalValue}</p>
      </div>
      <div style={{width: 'fit-content', height: 'fit-content'}} ref={ref}>
        <img
          onLoad={() => {
            setImageLoaded(true);
          }}
          src={imgSource}
        />
      </div>
    </div>
  );
}
