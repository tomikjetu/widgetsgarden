import { Routes, Route, Navigate, useLoaderData } from "react-router-dom";
import axios from "axios";

import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import NotFound from "./Pages/NotFound";
import { useEffect, useState } from "react";

import TermsOfServices from "./Pages/TermsOfServices";
import PreviewWidget from "./Pages/Dashboard/Components/WidgetsEditor/PreviewWidget";
import { LoadNotifications } from "./Pages/Dashboard/Messages";

import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function AppLoader() {
  axios.defaults.withCredentials = true;
  var profileResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/profile`);

  var profile = profileResponse.data;
  if (Object.keys(profile).length == 0) profile = null;
  return { profile };
}

function Logout() {
  const [loading, setLoading] = useState(true);
  axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/logout`).then(() => {
    setLoading(false);
  });

  return <>{loading ? <p>Loging out...</p> : <Navigate replace="true" to="/" />}</>;
}

function App() {
  var { profile } = useLoaderData();

  var [notifications, setNotifications] = useState(0);

  useEffect(() => {
    if (!profile) return;
    LoadNotifications();
    window.addEventListener("notifications", (event) => {
      setNotifications(event.detail);
    });
  }, []);

  return (
    <div id="app">
      <ToastContainer position="bottom-left" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" transition={Bounce} />
      <div className="content">
        <div className="container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={profile ? <Navigate replace="true" to="/dashboard" /> : <Login />} />
            <Route path="/logout" element={profile ? <Logout /> : <Navigate replace="true" to="/" />} />
            <Route path="/terms-of-service" element={<TermsOfServices />} />
            <Route path="/preview/:ID" Component={PreviewWidget} />
            <Route path="/dashboard/*" element={profile ? <Dashboard profile={profile} notifications={notifications} /> : <Navigate replace="true" to="/login" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
