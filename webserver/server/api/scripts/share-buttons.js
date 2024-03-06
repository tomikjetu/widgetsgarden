window.addEventListener("widgetEvent", function (event) {
  var { headers, body } = event.detail;
  if (headers.plugin != "share_buttons") return;

  switch (body.data.app) {
    case "facebook":
      window.open(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(window.location.href)}`);
      break;
    case "reddit":
      window.open(`https://reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(body.data.title)}`);
      break;
    case "twitter":
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(body.data.title)}&hashtags=${encodeURIComponent(body.data.hashtags)}`);
      break;
    case "linkedin":
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`);
      break;
    case "whatsapp":
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(body.data.title)}%20${encodeURIComponent(window.location.href)}`);
      break;
  }
});
