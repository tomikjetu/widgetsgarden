import { useEffect, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto"; // IMPORTANT
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { BackIcon, DashboardCollumn, DashboardCollumnsTwo } from "../../Styles/Svg";
import { ChartOptions, getChartData } from "../../Misc/Charts";
import { getCookie, setCookie } from "../../Misc/Cookies";
import TextOptions from "./Components/WidgetsEditor/Components/Options";

const defaultSettings = {
  "dashboard-collumns": 2,
  "dashboard-timespan": 30,
};

var timespanOptions = [
  {
    text: "Last 7 days",
    value: 7,
  },
  {
    text: "Last 30 days",
    value: 30,
  },
  {
    text: "Last 90 days",
    value: 90,
  },
];

export default function AnalyticsPage() {
  axios.defaults.withCredentials = true;

  const [analytics, setAnalytics] = useState(null);

  var [GridCollumns, setGridCollumns] = useState(2);
  var [Timespan, setTimespan] = useState(30);
  var [startDate, setStartDate] = useState(new Date());
  var [endDate, setEndDate] = useState(new Date());

  function getSetting(name) {
    return getCookie(name) || defaultSettings[name];
  }

  useEffect(() => {
    setGridCollumns(getSetting("dashboard-collumns"));
    setTimespan(getSetting("dashboard-timespan"));
    
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (GridCollumns == null) return;
    setCookie("dashboard-collumns", GridCollumns, null, "/dashboard");
  }, [GridCollumns]);

  useEffect(() => {
    if (Timespan == null) return;
    setCookie("dashboard-timespan", Timespan, null, "/dashboard");
    setStartDate(new Date().setDate(new Date().getDate() - Timespan));
    setEndDate(new Date());
  }, [Timespan]);

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
        <div className="dashboard-settings">
          <div
            onClick={() => {
              setGridCollumns(1);
            }}
            className={`dashboard-container setting ${GridCollumns == 1 ? "selected" : ""}`}
          >
            <span style={{ filter: "drop-shadow(0 0 2px black)", width: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <DashboardCollumn />
            </span>
          </div>
          <div
            onClick={() => {
              setGridCollumns(2);
            }}
            className={`dashboard-container setting ${GridCollumns == 2 ? "selected" : ""}`}
          >
            <span style={{ filter: "drop-shadow(0 0 2px black)", width: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <DashboardCollumnsTwo />
            </span>
          </div>
        </div>

        <div className="dashboard-settings">
          <TextOptions
            dashboardStyle
            defaultValue={Timespan}
            onChange={(value) => {
              setTimespan(value);
            }}
            options={timespanOptions}
          />
        </div>

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
              <div className="dashboard-container">
                <h2 className="bold">Visits by country</h2>
                {analytics?.overview?.user?.visit?.country && <Line style={{ maxHeight: "50vh" }} height={300} className="dashboard-overview" options={ChartOptions} data={getChartData(analytics?.overview?.user?.visit?.country, startDate, endDate)} />}
                {!analytics?.overview?.user?.visit?.country && <p>No collected data yet</p>}
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
