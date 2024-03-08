import axios from "axios";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Profile({ profile }) {
  axios.defaults.withCredentials = true;
  var currentPassword = useRef(null);
  var newPassword = useRef(null);
  var [responseMessage, setResponseMessage] = useState("");
  async function changePassword() {
    if (currentPassword.current.value == newPassword.current.value) return setResponseMessage("Please choose a different new password");

    var Response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/local/changePassword`, {
      currentPassword: currentPassword.current.value,
      newPassword: newPassword.current.value,
    });
    var { data } = Response;
    if (data.clear) {
      currentPassword.current.value = "";
      newPassword.current.value = "";
    }
    setResponseMessage(data.message);
  }

  return (
    <div className="editor">
      <header>
        <h1>Profile</h1>
        <Link to="/logout" style={{ marginLeft: "auto" }}>
          <button className="btn" style={{ background: "#0000001c", borderRadius: "7px" }}>
            Logout
          </button>
        </Link>
      </header>
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div
            className="dashboard-container"
            style={{
              alignItems: "start",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                width: "fit-content",
              }}
            >
              <img
                style={{
                  aspectRatio: "1/1",
                  objectFit: "cover",
                  borderRadius: "50%",
                  width: "100px",
                }}
                src={profile.picture}
                alt="profile picture"
              />
              <h1>{profile.username}</h1>
            </div>
            <div
              style={{
                width: "fit-content",
              }}
            >
              More coming soon.
            </div>
          </div>
          <div className="dashboard-container">
            <h3>Account Info</h3>

            <div style={{ textAlign: "center" }}>
              <p>
                Login Method:
                {profile.authenticationMethod == "google" && <span> Google</span>}
                {profile.authenticationMethod == "local" && <span> Email</span>}
              </p>

              <p>Email: {profile.email}</p>
            </div>
          </div>

          {profile.authenticationMethod == "local" && (
            <div className="dashboard-container">
              <h3>Change Password</h3>

              <input ref={currentPassword} className="login-control white" type="password" autoComplete="password" placeholder="Current Password" />
              <input ref={newPassword} className="login-control white" type="password" autoComplete="password" placeholder="New Password" />

              {responseMessage && <p>{responseMessage}</p>}

              <button onClick={changePassword} className="btn">
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
