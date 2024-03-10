import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { UpgradeIcon, WidgetsIcon, LockIcon, DocumentIcon, AnalyticsIcon, HomeIcon, RetractSidebarIcon, ExtendSidebarIcon } from "../../../../Styles/Svg";

import Profile from "./Profile";
import Notifications from "./Notifications";
import { NO_SIDEBAR_BREAK } from "../../../Dashboard";

export default function Sidebar({ notifications, sidebarToggle, profile, sidebarExtended, setSidebarExtended }) {
  const location = useLocation();
  const pathname = location.pathname;

  const sidebarRef = useRef();

  var [isDesktop, setDesktop] = useState(window.innerWidth >= NO_SIDEBAR_BREAK);
  useEffect(() => {
    window.addEventListener("resize", () => {
      var width = window.innerWidth;
      if (width >= NO_SIDEBAR_BREAK) setDesktop(true);
      else setDesktop(false);
    });
  }, []);

  useEffect(() => {
    sidebarRef.current.classList.add("activating");
    setTimeout(() => {
      sidebarRef.current.classList.toggle("active", sidebarToggle);
    }, 10);
    setTimeout(() => {
      sidebarRef.current.classList.remove("activating");
    }, 1000);
  }, [sidebarToggle]);

  return (
    <nav ref={sidebarRef} className={`sidebar ${pathname == "/dashboard/editor" ? "editor" : ""} ${sidebarExtended ? "extended" : ""}`}>
      {isDesktop && (
        <a className="sidebar-brand" href="/dashboard">
          {sidebarExtended && <h3 className="sidebar-title">WidgetsGarden</h3>}
          {!sidebarExtended && <h3 className="sidebar-title">WG</h3>}
        </a>
      )}

      <div className="sidebar-items">
        <a href="/dashboard" className={`sidebar-item ${pathname == "/dashboard" ? "sidebar-item-active" : ""}`}>
          <HomeIcon className="dashboard-icon" /> {sidebarExtended && <span className="sidebar-item-text">Home</span>}
        </a>
        <a href="/dashboard/access" className={`sidebar-item ${pathname == "/dashboard/access" ? "sidebar-item-active" : ""}`}>
          <LockIcon /> {sidebarExtended && <span className="sidebar-item-text">Access</span>}
        </a>
        <a href="/dashboard/widgets" className={`sidebar-item ${pathname == "/dashboard/widgets" ? "sidebar-item-active" : ""}`}>
          <WidgetsIcon /> {sidebarExtended && <span className="sidebar-item-text">Widgets</span>}
        </a>
        <a href="/dashboard/analytics" className={`sidebar-item ${pathname == "/dashboard/analytics" ? "sidebar-item-active" : ""}`}>
          <AnalyticsIcon /> {sidebarExtended && <span className="sidebar-item-text">Analytics</span>}
        </a>
      </div>
      <div className="sidebar-items sidebar-items-bottom">
        <a href="/dashboard/upgrade" className={`sidebar-item`}>
          <UpgradeIcon></UpgradeIcon> {sidebarExtended && <span>Pricing</span>}
        </a>
        <Notifications notifications={notifications} sidebarExtended={sidebarExtended} />
        <Profile profile={profile} sidebarExtended={sidebarExtended} />
        {isDesktop && (
          <div className="sidebar-item" onClick={() => setSidebarExtended(!sidebarExtended)}>
            {sidebarExtended && <RetractSidebarIcon />}
            {!sidebarExtended && <ExtendSidebarIcon />}
            {sidebarExtended && <span className="sidebar-item-text">Hide Sidebar</span>}
          </div>
        )}
      </div>
    </nav>
  );
}
