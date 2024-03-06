widgetsGardenAgePopup = {
  COOKIE: "widgetsgarden-age-verified",
  LoadCookies() {
    var ageVerified = widgetsGardenAgePopup.isAgeVerified();
    if (ageVerified == "true") return;
    widgetsgarden.getWidgetsId("age-verification", (widgetId) => {
      widgetsgarden.DisplayWidget(widgetId, true);
    });
  },
  isAgeVerified() {
    return widgetsGardenCookiesModule.getCookie(widgetsGardenAgePopup.COOKIE);
  },
  VerifyAge(widgetId, verified, redirect) {
    if (verified){
        widgetsgarden.DisplayWidget(widgetId, false);
        widgetsGardenCookiesModule.setCookie(widgetsGardenAgePopup.COOKIE, true);
    } else{
        window.location = redirect;
    }
  },
};

var Initialization = setInterval(() => {
  if (widgetsgarden.isScriptLoaded("widgetsgarden-cookies")) {
    clearInterval(Initialization);
    widgetsGardenAgePopup.LoadCookies();
  }
}, 100);

window.addEventListener("widgetEvent", function (event) {
  var { headers, body } = event.detail;
  if (headers.name != "age-verification") return;
  widgetsGardenAgePopup.VerifyAge(headers.widgetId, body.data.verified, body.data.redirect);
});
