import { useEffect, useState } from "react";
import axios from "axios";
import "../../Styles/Dashboard/messages.css";
import { BinIcon, LinkIcon, ShareIcon, StarIcon } from "../../Styles/Svg.jsx";

export async function LoadNotifications() {
  return new Promise(async (resolve) => {
    var messagesResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/messages`);
    var notifications = messagesResponse.data?.reverse();
    if (!notifications) return resolve([]);
    resolve(notifications);
    window.dispatchEvent(
      new CustomEvent("notifications", {
        detail: notifications.filter((notification) => notification.read == false).length,
      })
    );
  });
}

export default function Messages() {
  axios.defaults.withCredentials = true;
  var [notifications, setNotifications] = useState([]);

  useEffect(() => {
    LoadMessages();
  }, []);

  async function LoadMessages() {
    setNotifications(await LoadNotifications());
  }

  function getNotification(id) {
    return notifications.filter((m) => m.messageId == id)[0] || null;
  }

  async function ReadNotification(id) {
    var notification = getNotification(id);
    if (!notification.read) {
      await axios.put(`${process.env.REACT_APP_SERVER_URL}/dashboard/message/read/${id}`);
      LoadNotifications();
    }
  }

  async function DeleteNotification(id) {
    await axios.delete(`${process.env.REACT_APP_SERVER_URL}/dashboard/message/${id}`);
    LoadMessages();
  }

  function openNotification(id) {
    ReadNotification(id);
    var lastReading = document.getElementsByClassName("reading")[0];
    if (lastReading) lastReading.classList.toggle("reading", false);
    var element = document.getElementById(`notification-${id}`);
    if (lastReading == element) return;
    element.classList.toggle("reading");
  }

  // Unread, read, archived
  var [filters, setFilters] = useState([true, true, false]);

  function filter(id) {
    setFilters((prevState) => prevState.map((item, idx) => (idx === id ? !item : item)));
  }

  return (
    <div className="editor">
      <header style={{ display: "flex" }}>
        <h1>Messages</h1>
      </header>
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div key={filters.join("")} className="messages dashboard-container">
            <div className="dashboard-status filters">
              <div
                onClick={() => {
                  filter(0);
                }}
                className={`filter ${filters[0] ? "selected" : ""}`}
              >
                Unread
              </div>
              <div
                onClick={() => {
                  filter(1);
                }}
                className={`filter ${filters[1] ? "selected" : ""}`}
              >
                Read
              </div>
              <div
                onClick={() => {
                  filter(2);
                }}
                className={`filter ${filters[2] ? "selected" : ""}`}
              >
                Archived
              </div>
            </div>

            {notifications.map((notification) => {
              var display = false;
              if (filters[0] && !notification.read) display = true;
              if (filters[1] && notification.read) display = true;
              if (!filters[2] && notification.archived) display = false;
              if (filters[2] && notification.archived) display = true;

              if (!display) return;

              return (
                <div
                  onClick={() => {
                    openNotification(notification.messageId);
                  }}
                  id={`notification-${notification.messageId}`}
                  className={`message ${notification.read ? "read" : ""}`}
                  key={notification.messageId}
                >
                  <div className="titlewrapper">
                    <p className="title">
                      {notification.title || "Untitled Message"}

                      {notification.archived && (
                        <span style={{ width: "16px" }}>
                          <BinIcon />
                        </span>
                      )}

                      {notification.important && (
                        <span style={{ width: "16px" }}>
                          <StarIcon />
                        </span>
                      )}
                    </p>
                    <div className="actions">
                      {notification.link && (
                        <span
                          className="large"
                          onClick={() => {
                            window.location.href = notification.link;
                          }}
                        >
                          <LinkIcon />
                        </span>
                      )}
                      <span
                        onClick={() => {
                          DeleteNotification(notification.messageId);
                        }}
                      >
                        <BinIcon />
                      </span>
                    </div>
                  </div>
                  <div className="contentWrapper">
                    <p>{notification.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}