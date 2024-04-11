// Fetch info about the widget

var info = null,
  data = null,
  authorized = null,
  analytics = false;

var PLUGINS;

fetch("/api/plugins/data")
  .then((res) => res.json())
  .then((pluginPresets) => {
    PLUGINS = pluginPresets;
    fetch(`/api/widget/data?widgetId=${widgetId}&apiKey=${apiKey}&secret=${secret}`)
      .then((res) => res.json())
      .then((fetchedInfo) => {
        info = fetchedInfo;
        data = fetchedInfo.data;
        analytics = fetchedInfo.analytics;

        authorized = fetchedInfo.authorized;

        window.dispatchEvent(new CustomEvent("widgetLoad"));
      });
  });

const loadedScriptsWeb = [];
function isWebScriptLoaded(name) {
  var script = `/scripts/${name}.js`;
  return loadedScriptsWeb.includes(script);
}
function WebScriptLoadedEvent(script) {
  loadedScriptsWeb.push(script);
  window.dispatchEvent(new CustomEvent("webScriptLoaded", { detail: { script } }));
}

const WidgetLoadScript = [];
var ScriptsLength = 0;
async function loadScriptWidget(url) {
  ScriptsLength += 1;
  return new Promise((resolve) => {
    if (WidgetLoadScript.includes(url)) return;
    var script;
    if (url.includes(".js")) {
      script = document.createElement("script");
      script.src = `${url}?apiKey=${apiKey}`;
    } else if (url.includes(".css")) {
      script = document.createElement("link");
      script.rel = "stylesheet";
      script.type = "text/css";
      script.href = `${url}?apiKey=${apiKey}`;
    }
    script.addEventListener("load", () => {
      window.dispatchEvent(new CustomEvent("widgeScriptLoaded", { detail: { script: url } }));
      WidgetLoadScript.push(url);
      resolve();
    });
    document.head.appendChild(script);
  });
}

// Functions

function sendMessage(data, plugin) {
  window.parent.postMessage(
    {
      headers: {
        widgetId: info.widgetId,
        plugin,
      },
      body: data,
    },
    "*"
  );
}

var textColor = function (backgroundColor) {
  var result = /^rgba\(([0-9]{0,3}), ?([0-9]{0,3}), ?([0-9]{0,3}), ?([.0-9]{0,})\)$/i.exec(backgroundColor);
  if (!result) {
    return "#000000"; //Happens when not given hex
  }
  if (parseFloat(result[4]) < 0.5) return "#000000";
  var shade = (parseInt(result[1]) + parseInt(result[2]) + parseInt(result[3])) / 3;
  return shade > 128 ? "#000000" : "#FFFFFF";
};

// Events

window.addEventListener("message", receiveMessage);
window.addEventListener("widgetLoad", Load);

function Load() {
  if (!authorized) return;
  var widgetData = data.filter((e) => e.type == "Widget")[0];
  sendMessage({ event: "widgetLoad", data: { ...info, authorized, widgetData } });
  LoadScripts();
}

async function LoadScripts() {
  var widgetData = data.filter((e) => e.type == "Widget")[0];
  if (widgetData.data) {
    widgetData.data.plugins.forEach((pluginid) => {
      var PL = PLUGINS.filter((pl) => pl.id == pluginid)[0];
      PL.scripts.widget.forEach((script) => {
        loadScriptWidget(script);
      });
      PL.scripts.website.forEach((script) => {
        sendMessage({ event: "loadScript", data: { script } });
      });
    });
  }

  let checkInterval = setInterval(() => {
    if (WidgetLoadScript.length == ScriptsLength) {
      clearInterval(checkInterval);
      LoadElements();
    }
  }, 20);
}

async function loadFunctionScripts(scripts) {
  var loadedWidget = [];
  var loadedWebsite = [];
  var WidgetLength = 0;
  var WebsiteLength = 0;
  return new Promise((resolve, reject) => {
    if (scripts) {
      if (scripts.widget) {
        WidgetLength = scripts.widget.length;
        scripts.widget.forEach((script) => {
          loadScriptWidget(script).then(() => {
            loadedWidget.push(script);
          });
        });
      }
      if (scripts.website) {
        WebsiteLength = scripts.website.length;
        scripts.website.forEach((script) => {
          sendMessage({ event: "loadScript", data: { script } });
          let checkIntervalInternal = setInterval(() => {
            if (isWebScriptLoaded(script)) {
              clearInterval(checkIntervalInternal);
              loadedWebsite.push(script);
            }
          }, 20);
        });
      }
    }

    let checkInterval = setInterval(() => {
      if (loadedWidget.length == WidgetLength && loadedWebsite.length == WebsiteLength) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 20);
  });
}

function LoadPluginFunctions(element, pluginfunctions) {
  var ElementId = element.id || "element-" + Math.floor(Math.random() * 999999);
  element.id = ElementId;
  if (pluginfunctions == null) return;
  pluginfunctions.forEach((pluginfunction) => {
    var { plugin, id, parameters } = pluginfunction;

    if (parameters == null) parameters = [];

    var PL = PLUGINS.filter((pl) => pl.id == plugin)[0];
    var FN = PL.functions.filter((fn) => fn.id == id)[0];

    loadFunctionScripts(FN.scripts).then(() => {
      try {
        var parsedParams = parameters?.map((param) => `"${typeof param.value == "string" ? param.value.replace(/\"/g, "'") : param.value}"`);
        var command = `${plugin}_${id}("${ElementId}", ${parsedParams?.join(", ")})`;
        command = command.replace(/(\r\n|\n|\r)/gm, " ");
        eval(command);
      } catch (error) {
        console.log(`[WidgetsGarden] Couldn't load plugin ${plugin}`);
      }
    });
  });
}

function LoadElements() {
  var widgetData = data.filter((e) => e.type == "Widget")[0];
  // Watermark
  const watermark = document.getElementById("watermark");
  if (watermark) {
    if (widgetData.width < 100) watermark.style.display = "none";
    else {
      console.log(watermarkColor)
      watermark.style.color = watermarkColor;
      var width = Math.min(24, parseInt(widgetData.width) / 8);
      watermark.style.fontSize = `${width}px`;
    }
  }

  var WidgetElement = document.getElementById("widget");
  LoadPluginFunctions(WidgetElement, widgetData.pluginfunctions);

  WidgetElement.style.backgroundColor = widgetData.backgroundColor;
  // WidgetElement.style.borderRadius = `${widgetData.data.borderRadius ?? 0}px`;
  if (watermark) watermark.style.marginRight = `${widgetData.data.borderRadius / 2}px`;

  data.forEach((element) => {
    var NewElement;
    switch (element.type) {
      case "Text":
        NewElement = document.createElement("p");
        NewElement.innerText = element.pluginfunctions.some((pf) => typeof pf.lock == "object" && pf.lock.includes("data.text")) ? "" : element.data.text;
        NewElement.style["font-size"] = `${element.data.font.size}px`;
        NewElement.style["font-family"] = element.data.font.family;
        NewElement.style.textTransform = element.data.font.transform || "none";
        NewElement.style.color = element.data.font.color;
        break;
      case "Image":
        NewElement = document.createElement("img");
        NewElement.src = element.pluginfunctions.some((pf) => typeof pf.lock == "object" && pf.lock.includes("data.url")) ? "" : element.data.url;
        NewElement.style.width = `${element.width}px`;
        NewElement.style.height = `${element.height}px`;
        break;
      case "Button":
        NewElement = document.createElement("button");
        NewElement.innerText = element.pluginfunctions.some((pf) => typeof pf.lock == "object" && pf.lock.includes("data.text")) ? "" : element.data.text;

        if (element.data.enableIcon) {
          var IconElement = document.createElement("img");
          IconElement.src = element.data.icon;
          IconElement.style.width = `${2 * element.data.font.size}px`;
          IconElement.style.height = `${2 * element.data.font.size}px`;
          NewElement.prepend(IconElement);
        }

        if (element.data.borderRadius) {
          if (element.data.borderStroke > 0) NewElement.style.border = `${element.data.borderStroke}px solid ${element.data.borderStrokeColor}`;
          NewElement.style.borderRadius = `${element.data.borderRadius}px`;
        }

        NewElement.style.width = `${element.width}px`;
        NewElement.style.height = `${element.height}px`;
        NewElement.style.backgroundColor = element.backgroundColor;
        NewElement.style["font-size"] = `${element.data.font.size}px`;
        NewElement.style["font-family"] = element.data.font.family;
        NewElement.style.color = element.data.font.color;
        break;
      case "Container":
        NewElement = document.createElement("div");
        NewElement.style.width = `${element.width}px`;
        NewElement.style.height = `${element.height}px`;
        NewElement.style.backgroundColor = element.backgroundColor;
        NewElement.style["font-size"] = `${element.data.font.size}px`;
        NewElement.style["font-family"] = element.data.font.family;
        NewElement.style.textTransform = element.data.font.transform || "none";
        NewElement.style.color = element.data.font.color;
        NewElement.style.overflowY = element.data.scroll ?? false ? "scroll" : "hidden";
        NewElement.style.overflowX = "hidden";
        NewElement.style.borderRadius = `${element.data.borderRadius ?? 0}px`;
        break;
    }
    if (!NewElement) return;
    WidgetElement.appendChild(NewElement);
    NewElement.style.position = "absolute";
    NewElement.style.left = `${element.x}px`;
    NewElement.style.top = `${element.y}px`;
    NewElement.style.zIndex = element.zIndex;

    if (element.pluginfunctions.length > 0) {
      LoadPluginFunctions(NewElement, element.pluginfunctions);
    }

    if (element.link) {
      if (!element.pluginfunctions.some((pf) => typeof pf.lock == "object" && pf.lock.includes("link"))) {
        NewElement.style.cursor = "pointer";
        NewElement.addEventListener("click", () => {
          window.open(element.link);
        });
      }
    }
  });

  // if (!styles) return;
  // document.getElementById("content").style.backgroundColor = styles.backgroundColor?.value || "";
  // document.getElementById("content").style.color = styles.foregroundColor?.value || "";
  // document.getElementById("content").style.fontSize = `${styles.fontSize?.value || 16}px`;

  // var borderWidth = parseInt(styles.borderWidth?.value);
  // if (borderWidth > 0) {
  //   document.getElementById("content").style.border = `${borderWidth}px solid ${styles.borderColor.value}`;
  //   document.getElementById("content").style.borderRadius = `${styles.borderRadius.value}px`;
  //   document.getElementById("content").style.width = `calc(100vw - ${2.2 * borderWidth}px)`;
  //   document.getElementById("content").style.height = `calc(100vh - ${2.2 * borderWidth}px)`;
  //   document.getElementById("watermark").style.marginRight = `${styles.borderRadius.value / 5}px`;
  //   document.getElementById("watermark").style.marginBottom = `${styles.borderRadius.value / 5}px`;
  // }
  if (screenshotPreview) console.log(`Loaded ${widgetData.width}x${widgetData.height}`);
}

function receiveMessage(messageEvent) {
  var payload = messageEvent.data;
  var { event, data } = payload;

  switch (event) {
    case "scriptLoaded":
      WebScriptLoadedEvent(data.script);
      break;
    case "webEvent":
      window.dispatchEvent(new CustomEvent("webEvent", { detail: data }));
      break;
    case "analytics":
      sendAnalytics(data);
      break;
  }
}

function sendAnalytics(data) {
  if (!analytics) return;

  var { analytic, value } = data;
  fetch(`/analytics`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    mode: "cors",
    body: JSON.stringify({
      secret,
      apiKey,
      widgetId,
      analytic,
      value,
    }),
  });
}

document.querySelector("body").addEventListener("mouseenter", AnalyticHover);
function AnalyticHover() {
  document.querySelector("body").removeEventListener("mouseenter", AnalyticHover);
  sendAnalytics({
    analytic: "hover",
    value: null,
  });
}

document.querySelector("body").addEventListener("click", AnalyticClick);
function AnalyticClick(e) {
  sendAnalytics({
    analytic: "click",
    value: {
      x: e.x,
      y: e.y,
    },
  });
}

// On functional button click
function AnalyticUse(data) {
  sendAnalytics({
    analytic: "use",
    value: data,
  });
}

// On user data submission
function AnalyticSubmit() {
  sendAnalytics({
    analytic: "submit",
    value: null,
  });
}
