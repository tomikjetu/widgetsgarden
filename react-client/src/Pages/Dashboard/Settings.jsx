import axios from "axios";

import { useEffect, useState } from "react";
import { BackIcon, SaveIcon } from "../../Styles/Svg";
import { useSearchParams } from "react-router-dom";

import InputStyle from "./Components/WidgetsEditor/Components/Styles/Input.module.css";
import { TickIcon, PenIcon } from "../../Styles/Svg";
import Modal from "../../Components/Modal";

import { toast } from "react-toastify";

export default function Settings() {
  axios.defaults.withCredentials = true;
  var [isSaved, setSaved] = useState(true);
  var [isOpenCloseModal, setOpenCloseModal] = useState(false);

  var [widgetId, setWidgetId] = useState(null);
  var [displayName, setDisplayName] = useState("Loading...");
  var [description, setDescription] = useState("Loading...");

  var [published, setPublished] = useState(null);

  function changeDisplayName(name) {
    setSaved(false);
    setDisplayName(name);
  }
  var [editingDisplayName, setEditingDisplayName] = useState(false);

  function changeDescription(name) {
    setSaved(false);
    setDescription(name);
  }
  var [editingDescription, setEditingDescription] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/widget?id=${searchParams.get("id")}`).then((res) => {
      if (res.data == null) return (window.location = "/dashboard/widgets");
      setWidgetId(res.data.widgetId);
      setDisplayName(res.data.displayName);
      setDescription(res.data.description || "");
    });

    axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/library/widget?id=${searchParams.get("id")}`).then((res) => {
      setPublished(res.data.published);
    });
  }, []);

  function closeSettings() {
    if (!isSaved) setOpenCloseModal(true);
    else closeWithoutSaving(true);
  }

  function closeWithoutSaving() {
    window.location = "/dashboard/widgets";
  }

  async function closeAndSave() {
    setOpenCloseModal(false);
    await saveSettingsToast();
    window.location = "/dashboard/widgets";
  }

  async function saveSettingsToast() {
    await toast.promise(saveSettings(), {
      pending: "Saving",
      success: "Widget Saved",
      error: "Error, please try again",
    });
  }

  async function saveSettings() {
    return new Promise((resolve) => {
      axios({
        method: "PUT",
        data: {
          widgetId,
          displayName,
          description,
        },
        url: `${process.env.REACT_APP_SERVER_URL}/dashboard/editwidgetinfo`,
      }).then((res) => {
        resolve();
        setSaved(true);
      });
    });
  }

  function publish() {
    return new Promise((resolve) => {
      axios({
        method: "PUT",
        url: `${process.env.REACT_APP_SERVER_URL}/dashboard/library/widget?id=${widgetId}`,
      }).then((res) => {
        resolve();
        setPublished((current) => !current);
      });
    });
  }

  return (
    <div className="editor">
      <header className="navigation">
        <span onClick={closeSettings} style={{ cursor: "pointer" }}>
          <BackIcon />
        </span>

        <div className="title">
          {editingDisplayName ? (
            <>
              <input name="widget-name" className={InputStyle.Input} defaultValue={displayName} onChange={(e) => changeDisplayName(e.target.value)} />
              <div
                className="edit"
                onClick={() => {
                  setEditingDisplayName(false);
                }}
              >
                <TickIcon />
              </div>
            </>
          ) : (
            <>
              <h2>{displayName}</h2>
              <div
                className="edit"
                style={{ display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}
                onClick={() => {
                  setEditingDisplayName(true);
                }}
              >
                <PenIcon />
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", marginLeft: "auto", marginRight: "2rem" }}>
          <span
            style={{ display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}
            onClick={function () {
              saveSettingsToast();
            }}
          >
            <SaveIcon />
          </span>
        </div>
      </header>
      <div className="dashboard-content">
        <Modal height="auto" className="close-modal" display={isOpenCloseModal} setDisplay={setOpenCloseModal}>
          <h2 style={{ marginBottom: "10px" }}>Are You sure?</h2>
          <div
            className="buttons"
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <button style={{ fontSize: "15px", whiteSpace: "nowrap" }} className="btn" onClick={() => closeWithoutSaving()}>
              Discard Changes
            </button>
            <button style={{ fontSize: "15px", whiteSpace: "nowrap" }} className="btn" onClick={() => closeAndSave()}>
              Save & Close
            </button>
            <button style={{ fontSize: "15px", whiteSpace: "nowrap" }} className="btn" onClick={() => setOpenCloseModal(false)}>
              Cancel
            </button>
          </div>
        </Modal>

        <div
          className="dashboard-grid"
          style={{
            padding: "1.5rem",
          }}
        >
          <div className="dashboard-container">
            <h3>Widget Description</h3>

            {editingDescription ? (
              <>
                <textarea name="widget-description" className={InputStyle.Input} value={description} onChange={(e) => changeDescription(e.target.value)} />
                <span style={{ cursor: "pointer" }} onClick={() => setEditingDescription(false)}>
                  <TickIcon />
                </span>
              </>
            ) : (
              <>
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {description || "Empty"}
                </p>
                <button className="btn" onClick={() => setEditingDescription(true)}>
                  EDIT
                </button>
              </>
            )}
          </div>

          <div className="dashboard-container">
            <h3>Publish Widget to the Library</h3>

            <p>{published ? "The widget is published to the library." : "The widget is not published to the library."}</p>

            <button className="btn" onClick={publish}>
              {published ? "Remove" : "Publish"}
            </button>
          </div>

          <div className="dashboard-container">
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}>
                <PenIcon />
              </span>
              Go to the Editor
            </h3>
            <a className="btn" href={`/dashboard/editor?id=${widgetId}`}>
              EDIT
            </a>
          </div>

          <iframe style={{ width: "100%", height: "50vh" }} src={`${process.env.REACT_APP_WEBSITE_URL}/preview/${widgetId}`} frameBorder="0"></iframe>
        </div>
      </div>
    </div>
  );
}
