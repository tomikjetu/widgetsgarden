import { useEffect, useState } from "react";
import axios from "axios";
import "../../Styles/Dashboard/widgets.css";
import { Link, useSearchParams } from "react-router-dom";
import { BackIcon, BinIcon, DocumentIcon, EmbedIcon, EyeIcon, GearIcon, PenIcon, TouchIcon } from "../../Styles/Svg";
import Modal from "../../Components/Modal";
import CodeCopy from "../../Components/CodeCopy";
import TextOptions from "./Components/WidgetsEditor/Components/Options";
import { getCookie, setCookie } from "../../Misc/Cookies";
import { getDashboardSetting } from "../Dashboard";

var sortOptions = [
  {
    text: "Last Modified",
    value: "lastModified",
  },
  {
    text: "Newest Created",
    value: "newest",
  },
  {
    text: "Oldest Created",
    value: "oldest",
  },
  {
    text: "Name (A-Z)",
    value: "nameA",
  },
  {
    text: "Name (Z-A)",
    value: "nameZ",
  },
];
export default function Widgets() {
  axios.defaults.withCredentials = true;
  var [widgets, setWidgets] = useState(null);

  var [sort, setSort] = useState(getDashboardSetting("dashboard-sort"));

  useEffect(() => {
    getWidgets();
  }, []);

  function getWidgets() {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/widgets`).then((res) => {
      setWidgets(res.data);
    });
  }

  useEffect(() => {
    if (sort == null) return;
    setCookie("dashboard-sort", sort, null, "/dashboard");
  }, [sort]);

  function sorted(widgets) {
    switch (sort) {
      case "lastModified":
        return widgets.sort((a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime());
      case "newest":
        return widgets.sort((a, b) => new Date(b.dateCreated ?? 0).getTime() - new Date(a.dateCreated ?? 0).getTime());
      case "oldest":
        return widgets.sort((a, b) => new Date(a.dateCreated ?? 0).getTime() - new Date(b.dateCreated ?? 0).getTime());
      case "nameA":
        return widgets.sort((a, b) => a.displayName.localeCompare(b.displayName));
      case "nameZ":
        return widgets.sort((a, b) => b.displayName.localeCompare(a.displayName));
    }
  }

  function createWidget() {
    axios.put(`${process.env.REACT_APP_SERVER_URL}/dashboard/widget`).then((res) => {
      var { id } = res.data;
      window.location = `/dashboard/editor?id=${id}`;
    });
  }

  function editWidget(widgetId) {
    window.location = `/dashboard/editor?id=${widgetId}`;
  }

  function widgetSettings(widgetId) {
    window.location = `/dashboard/widgets/settings?id=${widgetId}`;
  }

  var [deleteWidgetModal, setDeleteWidgetModal] = useState(false);
  var [codeEmbedModal, setCodeEmbedModal] = useState(false);
  var [embedId, setEmbedId] = useState("");
  var [deleteWidgetId, setDeleteWidgetId] = useState(0);

  function deleteWidget(widgetId) {
    setDeleteWidgetModal(true);
    setDeleteWidgetId(widgetId);
  }

  function deleteWidgetConfirmed() {
    setDeleteWidgetModal(false);
    axios({
      method: "DELETE",
      data: {
        widgetId: deleteWidgetId,
      },
      url: `${process.env.REACT_APP_SERVER_URL}/dashboard/widget`,
    }).then(() => {
      getWidgets();
    });
  }

  function codeEmbed(widgetId) {
    setEmbedId(widgetId);
    setCodeEmbedModal(true);
  }

  function widgetMouseOver(event, index) {
    var target = document.getElementsByClassName("widget")[index + 1];
    var width = target.clientWidth;
    var height = target.clientHeight;
    var x = event.pageX - target.offsetLeft;
    var y = event.pageY - target.offsetTop;

    var content = target.childNodes[0];

    content.style.translate = `${(x / width) * 10 - 5}px ${(y / height) * 10 - 5}px`;
  }

  function widgetMouseLeave(index) {
    var target = document.getElementsByClassName("widget")[index + 1];
    var content = target.childNodes[0];
    content.style.translate = `0px 0px`;
  }

  return (
    <div className="editor">
      <header>
        <Link to="/dashboard">
          <p>Home Icon</p>
        </Link>
        <h1>Widgets</h1>
        <p>PLS CHANGE THIS TO ICONS WITH TOOLTIP</p>
        <div className="dashboard-status">
          <Link to="/dashboard/analytics">
            <div className="dashboard-container">Analytics</div>
          </Link>
          <Link to="/dashboard/library">
            <div className="dashboard-container">Library</div>
          </Link>
        </div>
      </header>
      <div className="dashboard-content">
        <Modal height="auto" width="80%" className={"code-modal"} display={codeEmbedModal}>
          <p>
            Get your access code{" "}
            <a href="/dashboard/access" style={{ textDecoration: "underline" }}>
              here
            </a>
          </p>
          <CodeCopy code={`<div class="widgetsgarden" widgetId="${embedId}"></div>`} />
          <button className="btn" onClick={() => setCodeEmbedModal(false)}>
            Close
          </button>
        </Modal>

        <Modal height="auto" className="delete-modal" display={deleteWidgetModal} setDisplay={setDeleteWidgetModal}>
          <h2 style={{ marginBottom: "10px" }}>Are You sure?</h2>
          <div
            className="buttons"
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <button className="btn" onClick={() => deleteWidgetConfirmed()}>
              Delete
            </button>
            <button className="btn" onClick={() => setDeleteWidgetModal(false)}>
              Keep
            </button>
          </div>
        </Modal>

        <div className="dashboard-settings">
          <TextOptions
            dashboardStyle
            defaultValue={sort}
            onChange={(value) => {
              setSort(value);
            }}
            options={sortOptions}
          />
        </div>

        <div className="widgets">
          {widgets == null && (
            <>
              <div className="widget skeleton" />
              <div className="widget skeleton" />
              <div className="widget skeleton" />
            </>
          )}
          {widgets != null && (
            <>
              <div className="widget new" onClick={createWidget}>
                +
              </div>
              {sorted(widgets).map((widget, index) => {
                return (
                  <div
                    className="widget"
                    key={widget.widgetId}
                    onMouseMove={(e) => {
                      widgetMouseOver(e, index);
                    }}
                    onMouseLeave={(e) => {
                      widgetMouseLeave(index);
                    }}
                  >
                    <div className="widgetcontent">
                      <h4
                        onClick={() => {
                          editWidget(widget.widgetId);
                        }}
                      >
                        {widget.displayName}
                      </h4>

                      {/*<div className="stats">
                  <div className="stat">
                    <EyeIcon />
                    <p className="number">{700}</p>
                  </div>

                  <div className="stat">
                    <TouchIcon />
                    <p className="number">{200}</p>
                  </div>

                  <div className="stat">
                    <DocumentIcon />
                    <p className="number">{50}</p>
                  </div>
                </div> */}

                      <div className="actions">
                        <div className="actionsgroup">
                          <span
                            style={{
                              display: "block",
                              height: "1.5rem",
                              width: "1.5rem",
                              cursor: "pointer",
                            }}
                            onClick={() => editWidget(widget.widgetId)}
                          >
                            <PenIcon />
                          </span>
                          <span onClick={() => codeEmbed(widget.widgetId)}>
                            <EmbedIcon />
                          </span>
                          <span onClick={() => widgetSettings(widget.widgetId)}>
                            <GearIcon />
                          </span>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          <span onClick={() => deleteWidget(widget.widgetId)}>
                            <BinIcon />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
