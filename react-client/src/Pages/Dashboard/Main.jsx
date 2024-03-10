import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { setCookie } from "../../Misc/Cookies";
import { Link } from "react-router-dom";
import { GridSettings, getDashboardSetting } from "../Dashboard";

export default function Main({ profile }) {
  axios.defaults.withCredentials = true;

  const [overview, setOverview] = useState(null);

  /* SETTINGS START */

  var [GridCollumns, setGridCollumns] = useState(getDashboardSetting("dashboard-collumns"));

  useEffect(() => {
    LoadOverview();
  }, []);

  useEffect(() => {
    if (GridCollumns == null) return;
    setCookie("dashboard-collumns", GridCollumns, null, "/dashboard");
  }, [GridCollumns]);

  /* SETTINGS END */

  async function LoadOverview() {
    var overviewResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/overview`);
    setOverview(overviewResponse.data);
  }

  return (
    <div className="editor">
      <header>
        <h1>Dashboard</h1>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <GridSettings setGridCollumns={setGridCollumns} GridCollumns={GridCollumns} />
        </div>
      </header>
      <div className="dashboard-content">
        <div className="dashboard-status">
          <div className="dashboard-container">
            <div style={{ padding: "1rem", boxSizing: "border-box" }}>
              <h2 style={{ marginBottom: ".7rem" }}>Welcome back, {profile.username}!</h2>
              <p>Glad to see you in the garden!</p>
              {/* IMAGE HERE ABOVE 1000PX, transparent, maybe overflowing, abstract... */}
            </div>
          </div>
        </div>

        <div
          style={{
            gridTemplateColumns: `repeat(${GridCollumns}, 1fr)`,
          }}
          className="dashboard-grid dashboard-collumns"
        >
          <div className="dashboard-container analytics">
            <h3>Quick Access</h3>
            <div className="analytics-list">
              <a
                href="/dashboard/widgets"
                className="analytics-list-item analytics-item-with-stats"
              >
                <span>Widgets</span>
                <span className="number"> {overview?.user.widgets || "Loading..."}</span>
              </a>
            </div>
          </div>

          <Link to="/dashboard/access" className="dashboard-container">
            See Access dashboard
          </Link>
          <Link to="/dashboard/analytics" className="dashboard-container">
            See Analytics
          </Link>

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
    </div>
  );
}
