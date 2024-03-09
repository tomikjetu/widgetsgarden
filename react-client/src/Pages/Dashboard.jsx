import { useEffect, useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";

import MainPage from "./Dashboard/Main";
import AccessPage from "./Dashboard/Access";
import WidgetsPage from "./Dashboard/Widgets";
import UpgradePage from "./Dashboard/Upgrade";
import ProfilePage from "./Dashboard/Profile";
import MessagesPage from "./Dashboard/Messages";

import "../Styles/Dashboard/index.css";
import "../Styles/Dashboard/Environment/navbar.css";
import "../Styles/Dashboard/Environment/sidebar.css";

import { BurgerMenuIcon, DashboardCollumnIcon, DashboardCollumnsTwoIcon } from "../Styles/Svg";
import Sidebar from "./Dashboard/Components/Sidebar";
import AnalyticsPage from "./Dashboard/AnalyticsPage";
import Editor from "./Dashboard/Editor/Editor";
import Settings from "./Dashboard/Settings";
import Library from "./Dashboard/Library";
import Admin from "./Dashboard/Admin";
import { getCookie, setCookie } from "../Misc/Cookies";
import { Tooltip } from "react-tooltip";

export const dashboardDefaultSettings = {
  "dashboard-collumns": 2,
  "dashboard-timespan": 30,
  "dashboard-sort": "lastModified",
  "sidebar-extended": true
};

export function getDashboardSetting(name) {
  return getCookie(name) || dashboardDefaultSettings[name];
}

export function GridSettings({ setGridCollumns, GridCollumns }) {
  var IconStyles = {
    filter: "drop-shadow(0 0 2px black)",
    height: "1.2rem",
    width: "1.2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  return (
    <div className="dashboard-settings-group">
      <Tooltip id="tooltip-group-grid-settings" />
      <span
        data-tooltip-id="tooltip-group-grid-settings"
        data-tooltip-content="Single Column"
        data-tooltip-place="bottom"
        onClick={() => {
          setGridCollumns(1);
        }}
        className={`${GridCollumns == 1 ? "selected" : ""}`}
      >
        <span style={IconStyles}>
          <DashboardCollumnIcon />
        </span>
      </span>
      <span
        data-tooltip-id="tooltip-group-grid-settings"
        data-tooltip-content="Grid"
        data-tooltip-place="bottom"
        onClick={() => {
          setGridCollumns(2);
        }}
        className={`${GridCollumns == 2 ? "selected" : ""}`}
      >
        <span style={IconStyles}>
          <DashboardCollumnsTwoIcon />
        </span>
      </span>
    </div>
  );
}

export function TimeSettings({ setTimespan, timespan, transparent }) {
  return (
    <div className={`dashboard-settings-group ${transparent ? "transparent" : ""}`}>
      <span className={timespan == 7 ? "selected" : ""} onClick={() => setTimespan(7)}>
        7D
      </span>
      <span className={timespan == 14 ? "selected" : ""} onClick={() => setTimespan(14)}>
        14D
      </span>
      <span className={timespan == 30 ? "selected" : ""} onClick={() => setTimespan(30)}>
        30D
      </span>
      <span className={timespan == 90 ? "selected" : ""} onClick={() => setTimespan(90)}>
        90D
      </span>
    </div>
  );
}

export default function Dashboard({ profile, notifications }) {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const [sidebarExtended, setSidebarExtended] = useState(false);
  const ToggleSidebar = () => setSidebarToggle(!sidebarToggle);

  useEffect(()=>{
    setSidebarExtended(window.innerWidth < 1000 || getDashboardSetting("sidebar-extended"));

    window.addEventListener(("resize"), ()=>{
      var width = window.innerWidth;
      if(width < 1000) setSidebarExtended(true);
    });
  }, [])

  useEffect(()=>{
    if(!sidebarExtended) return;
    setCookie("sidebar-extended", sidebarExtended, null, "/dashboard");
  }, [sidebarExtended])

  return (
    <div className={`dashboard ${!sidebarExtended ? "extended" : ""}`}>
      <header>
        <Sidebar notifications={notifications} profile={profile} sidebarToggle={sidebarToggle} sidebarExtended={sidebarExtended} setSidebarExtended={setSidebarExtended} />

        <div className="dashboard-navigation">
          <div className="dashbord-navigtion-content">
            <div className="sidebar-toggler" onClick={ToggleSidebar}>
              <BurgerMenuIcon />
              {notifications > 0 && <span className="notifications-badge">{notifications}</span>}
            </div>

            <a className="navbar-brand" href="/dashboard">
              <h3 className="navbar-title">WidgetsGarden</h3>
            </a>
          </div>
        </div>
      </header>

      <main>
        <div>
          <Routes>
            <Route path="" Component={MainPage} />
            <Route path="access" Component={AccessPage} />
            <Route path="widgets" Component={WidgetsPage} />
            <Route path="analytics" Component={AnalyticsPage} />
            <Route path="upgrade" Component={UpgradePage} />
            <Route path="profile" element={<ProfilePage profile={profile} />} />
            <Route path="messages" element={<MessagesPage profile={profile} />} />
            <Route path="editor" element={<Editor />} />
            <Route path="widgets/settings" element={<Settings />} />
            <Route path="library" element={<Library />} />
            <Route path="admin" element={profile.admin ? <Admin /> : <Navigate replace="true" to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
