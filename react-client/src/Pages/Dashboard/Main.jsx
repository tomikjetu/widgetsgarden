import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto"; // IMPORTANT
import { Line } from "react-chartjs-2";
import { DashboardCollumn, DashboardCollumnsTwo } from "../../Styles/Svg";
import { getCookie, setCookie } from "../../Misc/Cookies";
import { ChartOptions } from "../../Misc/Charts";
import { Link } from "react-router-dom";

const defaultSettings = {
  "dashboard-collumns": 2,
};
export default function Main() {
  axios.defaults.withCredentials = true;

  const [overview, setOverview] = useState(null);

  var [GridCollumns, setGridCollumns] = useState(2);
  function getSetting(name) {
    return getCookie(name) || defaultSettings[name];
  }

  useEffect(() => {
    setGridCollumns(getSetting("dashboard-collumns"));
    LoadOverview();
  }, []);

  useEffect(() => {
    if (GridCollumns == null) return;
    setCookie("dashboard-collumns", GridCollumns, null, "/dashboard");
  }, [GridCollumns]);

  async function LoadOverview() {
    var overviewResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/overview`);
    setOverview(overviewResponse.data);
  }



  // var data = {
  //   datasets: [
  //     {
  //       label: "Total",
  //       data: overview?.chart.loaded,
  //       borderWidth,
  //       borderColor: "#5171a8", //line
  //       backgroundColor: "#3c6fc7", //points
  //       pointRadius: 1,
  //       pointHoverRadius: 4,
  //       tension: 0.05,
  //     },
  //     {
  //       label: "Authorized",
  //       data: overview?.chart.authorized,
  //       borderWidth,
  //       borderColor: "#00a000", //line
  //       backgroundColor: "#20a020", //points
  //       hidden: true,
  //       pointRadius: 1,
  //       pointHoverRadius: 4,
  //       tension: 0.05,
  //     },
  //     {
  //       label: "Unauthorized",
  //       data: overview?.chart.unauthorized,
  //       borderWidth,
  //       borderColor: "#ff0000", //line
  //       backgroundColor: "#ff2020", //points
  //       pointRadius: 1,
  //       pointHoverRadius: 4,
  //       tension: 0.05,
  //     },
  //   ],
  // };

  return (
    <div className="dashboard-content">
      <div className="dashboard-status">
        <a href="/dashboard/widgets" className="dashboard-container">
          <span>
            Widgets: <span className="number"> {overview?.user.widgets || "Loading..."}</span>
          </span>
        </a>
      </div>

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

      <div
        style={{
          gridTemplateColumns: `repeat(${GridCollumns}, 1fr)`,
        }}
        className="dashboard-grid dashboard-collumns"
      >
        <Link to="/dashboard/access" className="dashboard-container">
          See Access dashboard
        </Link>
        <Link to="/dashboard/analytics" className="dashboard-container">
          See Analytics
        </Link>
        {/* <div className="dashboard-container">
          <h2 className="bold">Account Usage</h2>
          {!overview && (
            <div className="lds-ellipsis-wrapper">
              <div id="overview-loading" className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}
          {overview && <Line style={{ maxHeight: "60vh" }} height={300} className="dashboard-overview" options={ChartOptions} data={data} />}
        </div> */}

        <div className="dashboard-container" style={{ minHeight: "200px" }}>
          <div className="center">
            <p>Thank you for using WidgetsGarden.</p>
            <p>To Learn about the projects and see updates join the discord.</p>
            <a href="https://discord.gg/3qMpH5FfZQ" target="_blank" className="btn" style={{ margin: "1em", background: "#36364d" }}>
              JOIN
            </a>
          </div>
        </div>

        <div className="dashboard-container" style={{ minHeight: "200px" }}>
          <div className="center">
            <h3 className="bold">How to use WidgetsGarden?</h3>
            <p>1. Import your access script</p>
            <p>2. Authorize your website/locahost</p>
            <p>3. Add Your Widgets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
