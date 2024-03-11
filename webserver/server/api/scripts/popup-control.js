window.addEventListener("widgetEvent", function (event) {
  var { headers, body } = event.detail;
  if (headers.plugin != "popup_control") return;
  switch (body.data.route) {
    case "display":
      console.log(body.data.open);
      widgetsgarden.DisplayWidget(headers.widgetId, body.data.open);
      break;
    case "register_leave":
      widgetsgarden_popup_control_register_leave(headers.widgetId);
      break;
    case "register_scroll":
      widgetsgarden_popup_control_register_scroll(headers.widgetId, body.data.scroll);
      break;
  }
});

function widgetsgarden_popup_control_register_leave(widgetId) {
  let open_popup = () => {
    var CookieControl = widgetsgarden.getWidgetById(widgetId).CookieControl;    
    if (!CookieControl) widgetsgarden.DisplayWidget(widgetId, true);
    document.removeEventListener("mouseleave", open_popup);
  };

  document.addEventListener("mouseleave", open_popup);
}

function widgetsgarden_popup_control_register_scroll(widgetId, scroll) {
  let open_popup = (e) => {
    let percentage = window.scrollY / (document.body.offsetHeight - window.innerHeight);
    if (percentage < scroll / 100) return;
    var CookieControl = widgetsgarden.getWidgetById(widgetId).CookieControl;    
    if (!CookieControl) widgetsgarden.DisplayWidget(widgetId, true);
    document.removeEventListener("scroll", open_popup);
  };

  window.addEventListener("scroll", open_popup);
}
