import axios from "axios";
import { useEffect, useState } from "react";
import { BackIcon, CopyIcon } from "../../Styles/Svg";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { PreviewIcon } from "../../Styles/Svg";

export default function Library() {
  axios.defaults.withCredentials = true;

  // todo create database
  // todo load all items from library / paginated
  // copy widget from library

  var [GridCollumns, setGridCollumns] = useState(2);
  var [widgets, setWidgets] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/library/widgets`).then((res) => {
      setWidgets(res.data);
    });
  }, []);

  function copyWidget(widget) {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/library/copy?id=${widget.widgetId}`).then((res) => {
      var widgetId = res.data.success;
      if (!widgetId) window.location.href = "/dashboard/library";
      else window.location.href = `/dashboard/editor?id=${widgetId}`;
    });
  }

  return (
    <div className="editor">
      <header style={{ display: "flex" }}>
        <Link to="/dashboard/widgets">
          <BackIcon />
        </Link>
        <h1>Library</h1>
      </header>

      <div className="dashboard-content">
        <Tooltip id="screenshots-tooltip" place="bottom" style={{ zIndex: 5000 }} />
        <div className="widgets">
          {widgets.map((widget, index) => {
            return (
              <div
                className={`widget ${GridCollumns == 1 ? "list" : ""}`}
                style={{
                  backgroundImage: `url(${process.env.REACT_APP_SERVER_URL}/assets/screenshots/${widget.widgetId})`,
                  backgroundSize: "cover",
                }}
                key={index}
              >
                <div className="widgetcontent">
                  <div
                    style={{
                      padding: ".5rem 1rem",
                      backgroundColor: "rgba(0,0,0,.5)",
                    }}
                  >
                    <h4 onClick={() => copyWidget(widget)}>{widget.displayName}</h4>
                    <h3>By: {widget.userName}</h3>

                    <p>{widget.description}</p>
                  </div>
                  <div style={{ padding: ".5rem 1rem", backgroundColor: "rgba(0,0,0,.5)", width: "calc(100% - 2rem)" }} className="actions">
                    <div className="actionsgroup">
                      <span onClick={() => copyWidget(widget)}>
                        <CopyIcon />
                      </span>
                      <span data-tooltip-html={`<img src='${process.env.REACT_APP_SERVER_URL}/assets/screenshots/${widget.widgetId}'/>`} data-tooltip-id="screenshots-tooltip" data-tooltip-place="bottom">
                        <PreviewIcon />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
