var widgetsgarden = {
  LOADED: false,
  URL: "SERVER_PLACEHOLDER",
  AUTHENTICATION: "AUTHENTICATION_PLACEHOLDER",
  WIDGETS: [],
  getWidgetById(widgetId) {
    return widgetsgarden.WIDGETS.filter((widget) => widget.widgetId == widgetId)[0];
  },
  loadWidgets() {
    if (this.LOADED) return;
    // Load Global Styles
    this.loadStyles(`${this.URL}/widgetsgarden.css?apiKey=${this.AUTHENTICATION}`);
    // Define the ORIGIN of widgets
    this.ORIGIN = this.URL.match(/(https?|ftp):\/\/[.a-z:0-9]+/)[0];
    // Listen for messages from widgets
    window.addEventListener("message", this.receiveMessage, false);
    // Find all widgets in the page and load them
    document.querySelectorAll(".widgetsgarden").forEach((widget) => {
      this.reloadWidget(widget);
    });
  },
  generateWidget(widgetId) {
    return `${this.URL}/widget?widgetId=${widgetId}&apiKey=${this.AUTHENTICATION}&path=${window.location.pathname}`;
  },
  loadedScripts: [],
  isScriptLoaded(name) {
    var script = `/scripts/${name}.js`;
    return widgetsgarden.loadedScripts.includes(script);
  },
  loadScript(source, url) {
    if (this.loadedScripts.includes(url)) return;
    var script = document.createElement("script");
    script.src = `${this.URL}${url}?apiKey=${this.AUTHENTICATION}`;
    script.addEventListener("load", () => {
      widgetsgarden.sendMessage(source, {
        event: "scriptLoaded",
        data: {
          script: url,
        },
      });
    });
    document.head.appendChild(script);
    this.loadedScripts.push(url);
  },
  loadStyles(url) {
    var link = document.createElement("link");
    link.href = url;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  },
  reloadWidget(widget) {
    widget.innerHTML = "";
    var widgetId = widget.getAttribute("widgetId");
    var url = widgetsgarden.generateWidget(widgetId);
    var widgetFrame = document.createElement("iframe");
    widgetFrame.style.display = "none";
    widgetFrame.src = url;
    widgetsgarden.WIDGETS.push({ widgetId, widgetFrame, element: widget });
    widget.appendChild(widgetFrame);
  },
  receiveMessage(messageEvent) {
    if (messageEvent.origin != widgetsgarden.ORIGIN) return;
    var payload = messageEvent.data;
    var { headers, body } = payload;
    if(body.event == "widgetForbidden"){
      let { widgetId } = headers;

      let widget = widgetsgarden.getWidgetById(widgetId);
      widget.widgetFrame.style.width = 200 + "px";
      widget.widgetFrame.style.height = 200 + "px";
      widgetsgarden.DisplayWidget(widgetId, true);
    }
    if (body.event == "widgetLoad") {
      var authorized = body.data.authorized;

      let { widgetId, widgetData } = body.data;

      // Loading widget data
      let widget = widgetsgarden.getWidgetById(widgetId);
      if (!widget && !authorized) return;

      if (widgetData) {
        var { height, width } = widgetData;
        var { popup, positionLock, backdropBlur, openDefaultly, borderRadius, borderStroke, borderStrokeColor } = widgetData.data;

        widget.widgetFrame.style.width = width + "px";
        widget.widgetFrame.style.height = height + "px";

        if (borderStroke > 0) widget.widgetFrame.style.border = `${borderStroke}px solid ${borderStrokeColor}`;
        widget.widgetFrame.style.borderRadius = `${borderRadius}px`; 

        if (popup) {
          widget.element.style.position = "fixed";
          widget.element.style["z-index"] = "999999";
          widget.element.style.top = "0";
          widget.element.style.left = "0";
          widget.element.style.width = "100vw";
          widget.element.style.height = "100vh";

          widget.widgetFrame.style.position = "fixed";

          function setPosition(top, right, bottom, left, unit, translate) {
            if (top) widget.widgetFrame.style.top = `${top}${unit}`;
            if (right) widget.widgetFrame.style.right = `${right}${unit}`;
            if (bottom) widget.widgetFrame.style.bottom = `${bottom}${unit}`;
            if (left) widget.widgetFrame.style.left = `${left}${unit}`;
            widget.widgetFrame.style.translate = translate;
          }

          switch (positionLock) {
            case "topRight":
              setPosition(20, 20, null, null, "px");
              break;
            case "bottomRight":
              setPosition(null, 20, 20, null, "px");
              break;
            case "bottomLeft":
              setPosition(null, null, 20, 20, "px");
              break;
            case "topLeft":
              setPosition(20, null, null, 20, "px");
              break;
            case "center": {
              setPosition(50, null, null, 50, "%", "-50% -50%");
              break;
            }
          }

          if (backdropBlur) widget.backdropBlur = true;
        }
      }

      var DisplayControl = (popup && openDefaultly) || !popup;

      var CookieControl = widgetData.pluginfunctions.find((pluginfunction) => pluginfunction.id == "cookie_control");
      if (popup && CookieControl) {
        var CookieParameter = CookieControl.parameters.find((parameter) => parameter.id == "cookie");
        var CookieName = CookieParameter.value;
        var value = widgetsgarden.getCookie(CookieName);
        if (value == "true") {
          DisplayControl = false;
          var Widget = widgetsgarden.getWidgetById(widgetId);
          Widget.CookieControl = true;
        }
      }

      widgetsgarden.DisplayWidget(widgetId, DisplayControl);
    }
    if (body.event == "loadScript") {
      widgetsgarden.loadScript(messageEvent.source, body.data.script);
    }
    if (body.event == "widgetEvent") {
      window.dispatchEvent(new CustomEvent("widgetEvent", { detail: payload }));
    }
    if (body.event == "redirect") {
      window.location = body.data.link;
    }
    if (body.event == "setCookie") {
      widgetsgarden.setCookie(body.data.name, body.data.value);
    }
  },
  // Widget (iframe Window)
  // data: {event: "", data: {}}
  sendMessage(widget, data) {
    data = JSON.parse(JSON.stringify(data));
    widget.postMessage(data, "*");
  },
  DisplayWidget(widgetId, display) {
    let widget = widgetsgarden.getWidgetById(widgetId);
    widget.widgetFrame.style.display = display ? "block" : "none";
    if (widget.backdropBlur) {
      widget.element.style["backdrop-filter"] = display ? "blur(3px)" : "";
    }
  },
  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  setCookie(name, value) {
    var date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    var expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  },
  sendAnalytics(analytic, value) {
    var referrer = window.location.origin;
    var path = window.location.pathname;

    fetch(`${this.URL.replace("/api", "")}/analytics?apiKey=${widgetsgarden.AUTHENTICATION}&referrer=${referrer}&path=${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: widgetsgarden.AUTHENTICATION,
        analytic,
        value,
      }),
    });
  },
  // widgetsgarden.sendWidgetAnalytics(widgetId, "view", true);
  sendWidgetAnalytics(widgetId, analytic, value) {
    var widget = this.getWidgetById(widgetId).widgetFrame.contentWindow;
    widgetsgarden.sendMessage(widget, {
      event: "analytics",
      data: {
        analytic,
        value,
      },
    });
  },
};

widgetsgarden.loadWidgets();
widgetsgarden.sendAnalytics("visit", null);
