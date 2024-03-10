import { BellIcon } from "../../../../Styles/Svg";
import { Link } from "react-router-dom";

export default function Notifications({ notifications, sidebarExtended }) {
  return (
    <Link to="/dashboard/messages">
      <div className="sidebar-item" type="button" href="#">
        <BellIcon /> 
        {sidebarExtended && <>
          <span>Messages</span>
          <span className="number" style={{ marginLeft: "auto" }}>{notifications}</span>
        </>}
      </div>
    </Link>
  );
}