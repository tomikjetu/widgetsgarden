import { Link } from "react-router-dom";
import { UserIcon } from "../../../Styles/Svg";

export default function Profile({ profile, sidebarExtended }) {
  return (
    <div>
      <Link to="/dashboard/profile">
        <div className="sidebar-item" href="#">
          <UserIcon/>
          {/* <img src="https://mdbootstrap.com/img/Photos/Avatars/img (31).jpg" className="rounded-circle dropdown-click" height="22" alt="" loading="lazy" /> */}
          {sidebarExtended && <p>{profile.username}</p>}
        </div>
      </Link>
    </div>
  );
}
