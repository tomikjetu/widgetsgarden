import { useEffect, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto"; // IMPORTANT
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { BackIcon } from "../../Styles/Svg";
import { ChartOptions, getChartData } from "../../Misc/Charts";
import { getCookie, setCookie } from "../../Misc/Cookies";

import MapChart from "../../Misc/Charts/MapChart";
import { GridSettings, TimeSettings, getDashboardSetting } from "../Dashboard";

export default function AnalyticsPage() {
  axios.defaults.withCredentials = true;

  const [analytics, setAnalytics] = useState(null);

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
      <header style={{ display: "flex" }}>
        <Link to="/dashboard/widgets">
          <BackIcon />
        </Link>
        <h1>Analytics</h1>
      </header>
      <div className="dashboard-content">
        <GridSettings setGridCollumns={setGridCollumns} GridCollumns={GridCollumns} />
        <TimeSettings timespan={timespan} setTimespan={setTimespan} />

        <div
          className="dashboard-grid"
          style={{
            gridTemplateColumns: `repeat(${GridCollumns}, 1fr)`,
          }}
        >
          {analytics.enabled ? (
            <>
              <div className="dashboard-container">
                <h2 className="bold">Visits by domain</h2>
                {analytics?.overview?.user?.visit?.origin && <Line style={{ maxHeight: "50vh" }} height={300} className="dashboard-overview" options={ChartOptions} data={getChartData(analytics?.overview?.user?.visit?.origin, startDate, endDate)} />}
                {!analytics?.overview?.user?.visit?.origin && <p>No collected data yet</p>}
              </div>
              <div className="dashboard-container">
                <h2 className="bold">Visits by path</h2>
                {analytics?.overview?.user?.visit?.path && <Line style={{ maxHeight: "50vh" }} height={300} className="dashboard-overview" options={ChartOptions} data={getChartData(analytics?.overview?.user?.visit?.path, startDate, endDate)} />}
                {!analytics?.overview?.user?.visit?.path && <p>No collected data yet</p>}
              </div>
              <div className="dashboard-container analytics">
                <MapChart source={analytics?.overview?.user?.visit?.country} noData={"No data collected yet"} setTimespan={setTimespan} timespan={timespan} title={"World Map"} id={"map-country-main"} fromColor={getComputedStyle(document.querySelector("*")).getPropertyValue(`--dashboard-container`)} toColor={"#daad60"} border={"#eee"} borderSize={".5px"} startDate={startDate} endDate={endDate} />
              </div>
            </>
          ) : null}

          <div className="dashboard-container">
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
              <button className="btn" onClick={() => enableAnalytics()}>
                {analytics.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
