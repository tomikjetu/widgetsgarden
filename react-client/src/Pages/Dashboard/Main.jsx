import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { setCookie } from "../../Misc/Cookies";

import { GridSettings, getDashboardSetting } from "../Dashboard";
import Analytic from "./Components/Elements/Analytic";
import { DiscordIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from "../../Styles/Svg";
import { Button } from "./Components/Elements/Buttons";
import { IntroductionBlock } from "./Components/Elements/Introduction";

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
          <IntroductionBlock guide={profile.guide}/>

          <div className="dashboard-container analytics">
            <h3>Quick Stats</h3>
            <div className="analytics-list">
              <Analytic label="Widgets Created" value={overview?.user.widgets} link="/dashboard/widgets" />
              <Analytic label="Last 7 Days Visits" value={"Unknown"} link="/dashboard/analytics" />
              <Analytic label="Last 7 Days Usage" value={"Unknown"} link="/dashboard/access" />
            </div>
            <h3>WidgetsGarden</h3>
            <div className="analytics-list">
              <Analytic label="Library" value={"Unknown"} link="/dashboard/library" />
            </div>
          </div>

          <div className="dashboard-container" style={{ minHeight: "200px" }}>
            <div className="center" style={{ gap: "1rem" }}>
              <h3>We're all about community!</h3>
              <a href="https://discord.gg/3qMpH5FfZQ" target="_blank">
                <Button background="#736347">
                  <DiscordIcon /> Join Our Discord Community
                </Button>
              </a>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", width: "100%" }}>
                <a href="" target="_blank">
                  <Button style={{ width: "4rem", aspectRatio: 1 }} background="#736347">
                    <InstagramIcon />
                  </Button>
                </a>
                <a href="" target="_blank">
                  <Button style={{ width: "4rem", aspectRatio: 1 }} background="#736347">
                    <TiktokIcon />
                  </Button>
                </a>
                <a href="" target="_blank">
                  <Button style={{ width: "4rem", aspectRatio: 1 }} background="#736347">
                    <YoutubeIcon />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
