var INITIALIZED = false;

function learnMore() {
  const { learnMoreLink } = data;
  AnalyticUse("learn-more");
  sendMessage({
    event: "redirect",
    data: {
      link: learnMoreLink.value,
    },
  });
}

function acceptCookies() {
  AnalyticUse("accept");
  sendMessage({
    event: "widgetEvent",
    data: {
      accepted: true,
    },
  });
}

window.addEventListener("widgetLoad", () => {
  const { heading, caption } = data;

  document.getElementById("heading").innerText = heading.value;
  document.getElementById("caption").innerText = caption.value;
  document.getElementById("learn-more").onclick = learnMore;
  document.getElementById("accept-button").onclick = acceptCookies;
});

window.addEventListener("scriptLoaded", (event) => {
  var { script } = event.detail;
  INITIALIZED = isScriptLoaded("widgetsgarden-cookies");
});
