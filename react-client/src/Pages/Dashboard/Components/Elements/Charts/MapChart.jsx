import { geoPatterson } from "d3-geo-projection";
import { scaleLinear } from "d3-scale";
import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import ReactDOMServer from "react-dom/server";
import { TimeSettings } from "../../Pages/Dashboard";

const GEO_URL = "/map.json";

function TooltipValue({ name, value }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p>{name}</p>
      <p>{value ?? 0}</p>
    </div>
  );
}

export default function MapChart({ setTimespan, timespan, source, title, id, startDate, endDate, fromColor, toColor, border, borderSize, noData }) {
  const width = 800;
  const height = 420;
  const projection = geoPatterson()
    .translate([width / 2, height / 2])
    .scale(120);

  const [data, setData] = useState([]);
  const [maxValue, setMaxValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const colorScale = scaleLinear()
    .domain([0, maxValue])
    .range([fromColor ?? "514c39", toColor ?? "daad60"]);

  useEffect(() => {
    if (!source) return;

    var entries = {};
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

    setData(tempData);
    setMaxValue(tempMaxValue);
    setTotalValue(tempTotalValue);
  }, [startDate, endDate, source]);

  if (!source) return <div className="dashboard-container analytics"> 
    <p>{noData}</p>
  </div>;

  return (
    <div className="dashboard-container analytics">
      <div className="analytics-container">
        <div className="analytics-stats">
          <h2 className="analytics-title">{title}</h2>
          <p className="analytics-main-value">{totalValue}</p>
        </div>
        <TimeSettings setTimespan={setTimespan} timespan={timespan} transparent />
      </div>
      <Tooltip
        id={id}
        style={{
          width: "fit-content",
        }}
      />
      <div className="" style={{
        display: 'flex',
        width: "100%"
      }}> {/* removed class chart-container */}
        <ComposableMap style={{maxHeight: "50vh", margin: 'auto'}} width={width} height={height} projection={projection}>
          {
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const value = data[geo.id];
                  return (
                    <Geography
                      data-tooltip-id={id}
                      data-tooltip-html={ReactDOMServer.renderToStaticMarkup(<TooltipValue name={geo.properties.name} value={value} />)}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                        strokeWidth: borderSize,
                      }}
                      key={geo.rsmKey}
                      geography={geo}
                      fill={value ? colorScale(value) : fromColor}
                      stroke={border}
                    />
                  );
                })
              }
            </Geographies>
          }
        </ComposableMap>
      </div>
    </div>
  );
}
