import { geoPatterson } from "d3-geo-projection";
import { scaleLinear } from "d3-scale";
import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "/map.json";
export default function MapChart({ source, startDate, endDate, fromColor, toColor }) {
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
    .range([fromColor ?? "white", toColor ?? "blue"]);

  useEffect(() => {
    if (!source) return;

    var entries = {};
    var tempData = {};

    Object.keys(source).forEach((entry) => {
      entries[entry] = Object.fromEntries(
        Object.entries(source[entry]).filter(([key]) => {
          var current = new Date(key).getTime();
          if (current >= startDate && current <= endDate) return true;
        })
      );
    });

    Object.keys(entries).forEach(function (key, index) {
      tempData[key] = Object.values(entries[key] ?? []).reduce((a, b) => a + b, 0);
    });

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

  if (!source) return "Loading...";

  return (
    <>
      <p>{totalValue}</p>
      <ComposableMap style={{ maxHeight: "50vh" }} width={width} height={height} projection={projection}>
        {
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const value = data[geo.id];
                return (
                  <Geography
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                    key={geo.rsmKey}
                    geography={geo}
                    fill={value ? colorScale(value) : fromColor}
                  />
                );
              })
            }
          </Geographies>
        }
      </ComposableMap>
    </>
  );
}
