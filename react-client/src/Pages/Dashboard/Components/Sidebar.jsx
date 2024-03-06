import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { UpgradeIcon, WidgetsIcon, LockIcon, DocumentIcon, MainDashboardIcon } from '../../../Styles/Svg';

import Profile from './Profile';
import Notifications from './Notifications';

export default function Sidebar({ notifications, sidebarToggle, profile }) {
  const location = useLocation();
  const pathname = location.pathname;

  const sidebarRef = useRef();

  useEffect(() => {

    // TODO on any link clcked toogle sidebar

    sidebarRef.current.classList.add('activating');
    setTimeout(() => {
      sidebarRef.current.classList.toggle('active', sidebarToggle);
    }, 10);
    setTimeout(() => {
      sidebarRef.current.classList.remove('activating');
  }, 1000);
  }, [sidebarToggle]);

  return <nav ref={sidebarRef} className={`sidebar ${pathname == "/dashboard/editor" ? "editor" : ""}`}>

    <a className="sidebar-brand" href="/dashboard">
      <h3 className="sidebar-title">WidgetsGarden</h3>
    </a>

    <div className="sidebar-items">
      <a href="/dashboard" className={`sidebar-item ${pathname == "/dashboard" ? "sidebar-item-active" : ""}`}><MainDashboardIcon className="dashboard-icon" /> <span>Main dashboard</span></a>
      <a href="/dashboard/access" className={`sidebar-item ${pathname == "/dashboard/access" ? "sidebar-item-active" : ""}`}><LockIcon /> <span>Access</span></a>
      <a href="/dashboard/widgets" className={`sidebar-item ${pathname == "/dashboard/widgets" ? "sidebar-item-active" : ""}`}><WidgetsIcon /> <span>Widgets</span></a>
    </div>
    <div className="sidebar-items sidebar-items-bottom">
      <a href="/dashboard/upgrade" className={`sidebar-item`}><UpgradeIcon></UpgradeIcon> <span>Pricing</span></a>
      <Notifications notifications={notifications} />
      <Profile profile={profile} />
    </div>
  </nav >
}