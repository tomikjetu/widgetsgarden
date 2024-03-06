import { useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";

import MainPage from "./Dashboard/Main";
import AccessPage from "./Dashboard/Access";
import WidgetsPage from "./Dashboard/Widgets";
import UpgradePage from "./Dashboard/Upgrade";
import ProfilePage from "./Dashboard/Profile";
import MessagesPage from "./Dashboard/Messages";

import "../Styles/Dashboard/index.css";
import "../Styles/Dashboard/navbar.css";
import "../Styles/Dashboard/sidebar.css";

import { BurgerMenuIcon } from "../Styles/Svg";
import Sidebar from "./Dashboard/Components/Sidebar";
import AnalyticsPage from "./Dashboard/AnalyticsPage";
import Editor from "./Dashboard/Editor/Editor";
import Settings from "./Dashboard/Settings";
import Library from "./Dashboard/Library";
import Admin from "./Dashboard/Admin";

export default function Dashboard({ profile, notifications }) {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const ToggleSidebar = () => setSidebarToggle(!sidebarToggle);

  return (
    <div className="dashboard">
      <header>
        <Sidebar notifications={notifications} profile={profile} sidebarToggle={sidebarToggle} />

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
            <Route path="admin" element={ profile.admin ? <Admin /> : <Navigate replace="true" to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
