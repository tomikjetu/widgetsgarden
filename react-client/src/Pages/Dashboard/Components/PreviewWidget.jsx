import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

import { SketchPicker } from "react-color";

import Styles from "../../../Styles/Dashboard/widgetPreview.module.css";
import { useState } from "react";
import { useEffect } from "react";
import { BinIcon, RefreshIcon } from "../../../Styles/Svg";
import { deleteCookie, getAllCookies } from "../../../Misc/Cookies";

var textColor = function (backgroundColor) {
  var result = /^rgba\(([0-9]{0,3}), ?([0-9]{0,3}), ?([0-9]{0,3}), ?([.0-9]{0,})\)$/i.exec(backgroundColor);
  if (!result) return "#000000"; //Happens when not given hex
  if (parseFloat(result[4]) < 0.5) return "#000000";
  var shade = (parseInt(result[1]) + parseInt(result[2]) + parseInt(result[3])) / 3;
  return shade > 128 ? "#000000" : "#FFFFFF";
};

export default function PreviewWidget() {
  const { ID } = useParams();

  var [backgroundColor, setBackgroundColor] = useState(localStorage.getItem("previewBackground") || "white");
  var [foregroundColor, setForegroundColor] = useState(textColor(backgroundColor));

  var [listedCookies, setListedCookies] = useState([]);
  useEffect(() => {
    listCookies();
    if(window.cookieStore != null){
      // Chrome support
      window.cookieStore.addEventListener("change", (event) => {
        listCookies();
      });
    }
  }, []);

  async function listCookies() {
    setListedCookies(getAllCookies());
  }

  function removeCookie(name) {
    deleteCookie(name);
    listCookies();
  }

  useEffect(() => {
    localStorage.setItem("previewBackground", backgroundColor);
  }, [backgroundColor]);

  return (
    <div style={{ backgroundColor }} className={Styles.previewWebsite}>
      <Helmet>
        <script defer src={`${process.env.REACT_APP_SERVER_URL}/widgetsgarden.js?apiKey=preview`}></script>
      </Helmet>
      <div className={Styles.previewHeader}>
        <h2>Demo Website</h2>
        <div className={Styles.previewNav}>
          <p
            onClick={() => {
              window.location.reload();
            }}
          >
            Refresh
          </p>
        </div>
      </div>
      <div style={{ color: foregroundColor }} className={Styles.previewBody}>
        <h1 className={Styles.demoTitle}>Widget Preview</h1>
        <p className={Styles.demoText}>Welcome to your widget demo website preview. Customize your experience by seamlessly changing the background color to suit your preferences.</p>

        <SketchPicker
          width="220px"
          color={backgroundColor}
          onChange={(e) => {
            var color = `rgba(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}, ${e.rgb.a})`;
            setBackgroundColor(color);
            setForegroundColor(textColor(color));
          }}
        />

        <div className={Styles.previewWidget}>
          <div className="widgetsgarden" widgetid={ID}></div>
        </div>
        <p className={Styles.demoText}>In case your widget doesn't open due to cookies. Here are stored cookies</p>

        <div
          style={{
            width: "80%",
            display: "flex",
            flexDirection: "column",
            gap: ".4rem",
            marginBottom: "4rem",
          }}
        >
          <div className="dashboard-container" style={{ marginBottom: ".5rem", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <p>Cookies</p>
            <span onClick={listCookies} style={{ filter: "drop-shadow(2px 4px 6px black)", display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}>
              <RefreshIcon />
            </span>
          </div>
          {listedCookies.length == 0 && (
            <div className="dashboard-container">
              <p>No cookies stored</p>
            </div>
          )}
          {listedCookies.length > 0 &&
            listedCookies.map((cookie) => {
              return (
                <div style={{ marginBottom: "0rem" }} className="dashboard-status" key={cookie.name}>
                  <div className="dashboard-container" style={{ display: "flex", justifyContent: "center" }}>
                    <p>{cookie.name}</p>
                  </div>
                  <div className="dashboard-container" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <p>{cookie.value}</p>
                    <span onClick={() => removeCookie(cookie.name)} style={{ filter: "drop-shadow(2px 4px 6px black)", display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}>
                      <BinIcon />
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
