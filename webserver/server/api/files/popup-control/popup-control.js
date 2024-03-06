function popup_control_cookie_control(elementId, ...parameters) {
  var cookie = parameters[0];
  // This Function is handled by the main script if present.
}

function popup_control_click_to_close(elementId, ...parameters) {
  var preventFutureOpen = parameters[0];
  var CookieControl = parameters[1];
  var element = document.getElementById(elementId);
  element.addEventListener("click", () => {
    AnalyticUse("close");
    sendMessage(
      {
        event: "widgetEvent",
        data: {
          route: "display",
          open: false,
        },
      },
      "popup_control"
    );
    if (preventFutureOpen) {
      sendMessage(
        {
          event: "setCookie",
          data: {
            name: CookieControl,
            value: true,
          },
        },
        "popup_control"
      );
    }
  });
}

function popup_control_mouse_leave_open(elementId, ...parameters) {
  var timeout = setInterval(() => {
    if (isWebScriptLoaded("popup-control")) {
      sendMessage(
        {
          event: "widgetEvent",
          data: {
            route: "register_leave",
          },
        },
        "popup_control"
      );
      clearInterval(timeout);
    }
  }, 100);
}

function popup_control_scroll_past_open(elementId, ...parameters) {
  var scroll = parseInt(parameters[0]);
  var timeout = setInterval(() => {
    if (isWebScriptLoaded("popup-control")) {
      sendMessage(
        {
          event: "widgetEvent",
          data: {
            route: "register_scroll",
            scroll,
          },
        },
        "popup_control"
      );
      clearInterval(timeout);
    }
  }, 100);
}
