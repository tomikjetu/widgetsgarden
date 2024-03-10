import { useEffect, useState } from "react";
import axios from "axios";
import "../../Styles/Dashboard/widgets.css";
import { Link, useSearchParams } from "react-router-dom";
import { AnalyticsIcon, BinIcon, DocumentIcon, EmbedIcon, EyeIcon, GearIcon, HomeIcon, PenIcon, SortAIcon, SortLastModifiedIcon, SortNewestCreatedIcon, SortOldestCreatedIcon, SortZIcon, TouchIcon, WidgetsIcon } from "../../Styles/Svg";
import CodeCopy from "../../Elements/CodeCopy";
import TextOptions from "./Components/WidgetsEditor/Components/Options";
import { setCookie } from "../../Misc/Cookies";
import { GridSettings, getDashboardSetting } from "../Dashboard";
import { Tooltip } from "react-tooltip";
import { Modal, ModalDelete } from "../../Elements/Modals";
import { EmbedModal } from "./Editor/Components/Modals/EmbedModal";

// it's own file
var sortOptions = [
  {
    icon: <SortLastModifiedIcon />,
    text: "Last Modified",
    value: "lastModified",
  },
  {
    icon: <SortNewestCreatedIcon />,
    text: "Newest Created",
    value: "newest",
  },
  {
    icon: <SortOldestCreatedIcon />,
    text: "Oldest Created",
    value: "oldest",
  },
  {
    icon: <SortAIcon />,
    text: "Name (A-Z)",
    value: "nameA",
  },
  {
    icon: <SortZIcon />,
    text: "Name (Z-A)",
    value: "nameZ",
  },
];
export default function Widgets() {
  axios.defaults.withCredentials = true;

  var [GridCollumns, setGridCollumns] = useState(2);
  var [widgets, setWidgets] = useState(null);

  var [sort, setSort] = useState(getDashboardSetting("dashboard-sort"));

  useEffect(() => {
    setGridCollumns(getDashboardSetting("dashboard-collumns"));
    getWidgets();
  }, []);

  useEffect(() => {
    if (GridCollumns == null) return;
    setCookie("dashboard-collumns", GridCollumns, null, "/dashboard");
  }, [GridCollumns]);

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
  var [deleteWidgetName, setDeleteWidgetName] = useState("");

  function deleteWidget(widgetId, widgetName) {
    setDeleteWidgetModal(true);
    setDeleteWidgetId(widgetId);
    setDeleteWidgetName(widgetName);
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
    if (GridCollumns == 1) return;
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
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-end",
          }}
        >
          <Link to="/dashboard">
            <span style={{ fontSize: "2rem" }}>
              <HomeIcon />
            </span>
          </Link>
          <h1>Widgets</h1>
        </div>
        <div
          style={{
            marginLeft: "1rem",
          }}
          className="dashboard-settings"
        >
          <Tooltip id="header-links-toolip" />
          <Link data-tooltip-content={"Analytics"} data-tooltip-id="header-links-toolip" data-tooltip-place="bottom" className="dashboard-container button" style={{ fontSize: "2rem" }} to="/dashboard/analytics">
            <AnalyticsIcon />
          </Link>
          <Link data-tooltip-content={"Library"} data-tooltip-id="header-links-toolip" data-tooltip-place="bottom" className="dashboard-container button" style={{ fontSize: "2rem" }} to="/dashboard/library">
            <WidgetsIcon />
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginLeft: "auto",
          }}
        >
          <GridSettings setGridCollumns={setGridCollumns} GridCollumns={GridCollumns} />
          <div
            style={{
              filter: "drop-shadow(#00000060 -2px 2px 10px)",
            }}
          >
            <TextOptions
              dashboardStyle
              defaultValue={sort}
              onChange={(value) => {
                setSort(value);
              }}
              options={sortOptions}
            />
          </div>
        </div>
      </header>
      <div className="dashboard-content">
        <EmbedModal embedId={embedId} codeEmbedModal={codeEmbedModal} setCodeEmbedModal={setCodeEmbedModal} />

        <ModalDelete title={deleteWidgetName} display={deleteWidgetModal} setDisplay={setDeleteWidgetModal} onClose={() => setDeleteWidgetModal(false)} onDelete={() => deleteWidgetConfirmed()}>
          <p>Are you sure you want to delete this widget? All widget data will be permanently deleted from your account and the library. This action cannot be undone.</p>
        </ModalDelete>

        <div className={`widgets ${GridCollumns == 1 ? "list" : ""}`}>
          {widgets == null && (
            <>
              <div className="widget skeleton" />
              <div className="widget skeleton" />
              <div className="widget skeleton" />
            </>
          )}
          {widgets != null && (
            <>
              <div className={`widget new ${GridCollumns == 1 ? "list" : ""}`} onClick={createWidget}>
                +
              </div>
              {sorted(widgets).map((widget, index) => {
                return (
                  <div
                    className={`widget ${GridCollumns == 1 ? "list" : ""}`}
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
                          <span onClick={() => deleteWidget(widget.widgetId, widget.displayName)}>
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
