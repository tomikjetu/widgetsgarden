const services = ["facebook", "instagram", "youtube", "snapchat", "linkedin"];
function getService(url) {
  for (var i = 0; i < services.length; i++) {
    var service = services[i];
    var REGEXP = new RegExp(`^(http(?:s?):\/\/)?(?:www\.)?${service}.com\/?`);
    if (url.match(REGEXP)) return service;
  }
  return "website";
}

DOMAIN = /^(?:https?:)?(?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/;

var SocialsElement = document.getElementById("socials");
function createSocial(url) {
  if (!url.startsWith("http")) url = `http://${url}`;

  var link = document.createElement("a");
  link.target = "_blank";
  link.classList.add("social");
  var social = getService(url);
  if (data.favicon.value === true && (social == "website" || data.iconpack.value == 0)) link.style.backgroundImage = `url(https://www.google.com/s2/favicons?domain=${url.match(DOMAIN)[0]}&sz=${64})`;
  if (data.iconpack.value == 1) link.classList.add(social);
  link.href = url;
  link.addEventListener("click", () => onSocialClick(url));
  SocialsElement.append(link);
}
window.addEventListener("widgetLoad", () => {
  data.links.value.forEach((url) => {
    createSocial(url.value);
  });
});

function onSocialClick(url) {
  AnalyticUse(url);
}
