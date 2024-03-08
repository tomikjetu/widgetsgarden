import axios from "axios";
import { useEffect, useState } from "react";
import { BackIcon, CopyIcon } from "../../Styles/Svg";
import { Link } from "react-router-dom";
export default function Library() {
  axios.defaults.withCredentials = true;

  // todo create database
  // todo load all items from library / paginated
  // copy widget from library

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

  function widgetMouseOver(event, index) {
    var target = document.getElementsByClassName("widget")[index];
    var width = target.clientWidth;
    var height = target.clientHeight;
    var x = event.pageX - target.offsetLeft;
    var y = event.pageY - target.offsetTop;

    var content = target.childNodes[0];

    content.style.translate = `${(x / width) * 10 - 5}px ${(y / height) * 10 - 5}px`;
  }

  function widgetMouseLeave(index) {
    var target = document.getElementsByClassName("widget")[index];
    var content = target.childNodes[0];
    content.style.translate = `0px 0px`;
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
        <div className="widgets">
          {widgets.map((widget, index) => {
            return (
              <div
                className="widget"
                key={index}
                onMouseMove={(e) => {
                  widgetMouseOver(e, index);
                }}
                onMouseLeave={(e) => {
                  widgetMouseLeave(index);
                }}
              >
                <div className="widgetcontent">
                  <h4 onClick={() => copyWidget(widget)}>{widget.displayName}</h4>
                  <h3>By: {widget.userName}</h3>

                  <p>{widget.description}</p>

                  <div className="actions">
                    <div className="actionsgroup">
                      <span onClick={() => copyWidget(widget)}>
                        <CopyIcon />
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
