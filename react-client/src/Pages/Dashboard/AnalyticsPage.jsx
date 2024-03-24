import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BackIcon } from "../../Styles/Svg";
import { setCookie } from "../../Misc/Cookies";

import MapChart from "./Components/Elements/Charts/MapChart";
import { GridSettings, TimeSettings, getDashboardSetting } from "../Dashboard";
import BarChartSeries from "./Components/Elements/Charts/BarChartSeries";
import BarChart from "./Components/Elements/Charts/BarChart";
import { Button } from "./Components/Elements/Buttons";
import TextOptions from "./Components/WidgetsEditor/Components/Options";
import TimeLineSeries from "./Components/Elements/Charts/TimeLineSeries";
import TimeLine from "./Components/Elements/Charts/TimeLine";

export default function AnalyticsPage() {
  axios.defaults.withCredentials = true;

  const [analytics, setAnalytics] = useState(null);
  const [widgetAnalytics, setWidgetAnalytics] = useState(null);

  var [GridCollumns, setGridCollumns] = useState(2);
  var [timespan, setTimespan] = useState(30);
  var [startDate, setStartDate] = useState(new Date());
  var [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    setGridCollumns(getDashboardSetting("dashboard-collumns"));
    setTimespan(getDashboardSetting("dashboard-timespan"));

    loadAnalytics();
  }, []);

  useEffect(() => {
    if (GridCollumns == null) return;
    setCookie("dashboard-collumns", GridCollumns, null, "/dashboard");
  }, [GridCollumns]);

  useEffect(() => {
    if (timespan == null) return;
    setCookie("dashboard-timespan", timespan, null, "/dashboard");
    setStartDate(new Date().setDate(new Date().getDate() - timespan));
    setEndDate(new Date());
  }, [timespan]);

  function loadAnalytics() {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/analytics`).then((res) => {
      setAnalytics(res.data);
    });
  }

  useEffect(() => {
    loadWidgetAnalytics(analytics?.overview?.widgets[0]?.id);
  }, [analytics]);

  function loadWidgetAnalytics(id) {
    if (!id) return;
    var data = analytics?.overview.widgets.filter((widget) => widget.id == id)[0]?.data;
    console.log(data);
    setWidgetAnalytics(data);
  }

  function enableAnalytics() {
    var enable; // The new value that will be set
    if (!analytics) enable = true;
    else enable = !analytics?.enabled;
    setAnalytics(null);
    axios
      .post(`${process.env.REACT_APP_SERVER_URL}/dashboard/enableAnalytics`, {
        enable,
      })
      .then(() => {
        loadAnalytics();
      });
  }

  if (!analytics) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-status">
          <div className="dashboard-container">Your analytics are preparing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <header>
        <Link to="/dashboard/widgets">
          <BackIcon />
        </Link>
        <h1>Analytics</h1>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <GridSettings setGridCollumns={setGridCollumns} GridCollumns={GridCollumns} />
          <TimeSettings timespan={timespan} setTimespan={setTimespan} />
        </div>
      </header>
      <div className="dashboard-content">
        {analytics.enabled ? (
          <>
            <div
              className="dashboard-grid"
              style={{
                gridTemplateColumns: `repeat(${GridCollumns}, 1fr)`,
              }}
            >
              <BarChartSeries source={analytics?.overview?.user?.visit?.path} noData={"No data collected yet"} setTimespan={setTimespan} timespan={timespan} title={"Websites"} id={"visits-path-main"} startDate={startDate} endDate={endDate} />
              <MapChart source={analytics?.overview?.user?.visit?.country} noData={"No data collected yet"} setTimespan={setTimespan} timespan={timespan} title={"World Map"} id={"map-country-main"} fromColor={getComputedStyle(document.querySelector("*")).getPropertyValue(`--dashboard-container`)} toColor={"#daad60"} border={"#eee"} borderSize={".5px"} startDate={startDate} endDate={endDate} />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <h1 style={{ marginBottom: ".5rem" }}>Widget Analytics</h1>
              <TextOptions
                dashboardStyle
                onChange={(value) => {
                  loadWidgetAnalytics(value);
                }}
                options={analytics?.overview?.widgets.map((widget) => {
                  return {
                    value: widget.id,
                    text: widget.displayName,
                  };
                })}
              />
            </div>

            <div className="dashboard-grid" style={{ marginTop: '1rem', gridTemplateColumns: `repeat(${GridCollumns}, 1fr)` }}>
              {
                widgetAnalytics ? (
                  <>
                    <TimeLine source={widgetAnalytics?.loadWidget?.timestamp} noData={"No data collected yet"} setTimespan={setTimespan} timespan={timespan} title={"Total Loads"} id={"widget-load-time"} startDate={startDate} endDate={endDate} />
                    <BarChartSeries source={widgetAnalytics?.loadWidget?.path} noData={"No data collected yet"} setTimespan={setTimespan} timespan={timespan} title={"Websites"} id={"widget-visits-path"} startDate={startDate} endDate={endDate} />
                  </>
                ) : null
              }
            </div>
          </>
        ) : null}
        <div className="dashboard-container" style={{ marginTop: "1rem" }}>
          <div className="center gap-1">
            <h3 className="bold">Analytics are {analytics.enabled ? "enabled" : "disabled"}</h3>
            {analytics.enabled ? (
              <p>
                Here you can see analytics of users visiting your webiste and usage of widgets.
                <br />
                Disabling collecting analytics won't delete already collected data.
                <br /> Analytics are collected on every page with your access script.
              </p>
            ) : (
              <p>Enable analytics to see performance of your website and widgets</p>
            )}
            <Button onClick={() => enableAnalytics()}>{analytics.enabled ? "Disable" : "Enable"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
