widgetsGardenCookiesPopup = {
  COOKIE: "widgetsgarden-cookies-accepted",
  LoadCookies() {
    var cookiesAccepted = widgetsGardenCookiesPopup.isCookiesAccepted();
    if (cookiesAccepted == "true") return;
    widgetsgarden.getWidgetsId("cookies-popup", (widgetId) => {
      widgetsgarden.DisplayWidget(widgetId, true);
    });
  },
  isCookiesAccepted() {
    return widgetsGardenCookiesModule.getCookie(widgetsGardenCookiesPopup.COOKIE);
  },
  AcceptCookies(widgetId) {
    widgetsgarden.DisplayWidget(widgetId, false);
    widgetsGardenCookiesModule.setCookie(widgetsGardenCookiesPopup.COOKIE, true);
  },
};

var Initialization = setInterval(() => {
  if (widgetsgarden.isScriptLoaded("widgetsgarden-cookies")) {
    clearInterval(Initialization);
    widgetsGardenCookiesPopup.LoadCookies();
  }
}, 100);

window.addEventListener("widgetEvent", function (event) {
  var { headers, body } = event.detail;
  if (headers.name != "cookies-popup") return;
  if ((body.data.accepted = true)) widgetsGardenCookiesPopup.AcceptCookies(headers.widgetId);
});
