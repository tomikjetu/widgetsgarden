async function fetchVideo(id) {
  return new Promise((resolve) => {
    fetch(`/api/widgetapi/youtube/video?videoId=${id}`)
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      });
  });
}

async function fetchChannel(id, limit) {
  return new Promise((resolve) => {
    fetch(`/api/widgetapi/youtube/channel?channelId=${id}&limit=${limit}`)
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      });
  });
}

async function fetchLatest(id) {
  return new Promise((resolve) => {
    fetch(`/api/widgetapi/youtube/latest?channelId=${id}`)
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      });
  });
}

function getViewsString(views) {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(views);
}

function getPublishedString(input) {
  const date = input instanceof Date ? input : new Date(input);
  const formatter = new Intl.RelativeTimeFormat("en");
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (let key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.floor(delta), key);
    }
  }
}

function createVideoElement(element, data) {
  if (data == null) return;

  var videoElement = document.createElement("div");
  videoElement.addEventListener("click", () => {
    AnalyticUse("view-video")
  })
  videoElement.classList.add("youtube_video");

  /*THUMBNAIL */

  var thumbnailWrapper = document.createElement("a");
  thumbnailWrapper.classList.add("youtube_video_thumbnail_wrapper");
  thumbnailWrapper.href = data.url;
  thumbnailWrapper.target = "_blank";

  var thumbnailImage = document.createElement("img");
  thumbnailImage.src = data.thumbnail;
  thumbnailImage.classList.add("youtube_video_thumbnail_image");

  var durationText = document.createElement("p");
  durationText.innerText = data.duration;
  durationText.classList.add("youtube_video_duration");

  thumbnailWrapper.append(thumbnailImage);
  thumbnailWrapper.append(durationText);

  videoElement.append(thumbnailWrapper);

  /* VIDEO INFO */

  var infoWrapper = document.createElement("div");
  infoWrapper.classList.add("youtube_video_info_wrapper");

  var authorThumbnailWrapper = document.createElement("a");
  authorThumbnailWrapper.target = "_blank";
  authorThumbnailWrapper.href = data.author_url;
  authorThumbnailWrapper.classList.add("youtube_video_info_author_thumbnail_wrapper");
  var authorThumbnail = document.createElement("img");
  authorThumbnail.classList.add("youtube_video_info_author_thumbnail");
  authorThumbnail.src = data.author_thumbnail;
  authorThumbnailWrapper.append(authorThumbnail);

  var detailsWrapper = document.createElement("div");
  detailsWrapper.classList.add("youtube_video_details_wrapper");

  var titleElement = document.createElement("a");
  titleElement.href = data.url;
  titleElement.target = "_blank";
  titleElement.innerText = data.title;
  titleElement.classList.add("youtube_video_info_title");

  var authorName = document.createElement("a");
  authorName.href = data.author_url;
  authorName.target = "_blank";
  authorName.innerText = data.name;
  authorName.classList.add("youtube_video_info_author");

  var details = document.createElement("p");
  var details1 = document.createElement("span");
  var details2 = document.createElement("span");
  var details3 = document.createElement("span");

  details.classList.add("youtube_video_info_details");

  details1.innerText = getViewsString(data.views);
  details2.classList.add("youtube_video_info_separator");
  details2.innerText = getPublishedString(data.published);

  details.append(details1);
  details.append(details2);
  details.append(details3);

  detailsWrapper.append(titleElement);
  detailsWrapper.append(authorName);
  detailsWrapper.append(details);

  infoWrapper.append(authorThumbnailWrapper);
  infoWrapper.append(detailsWrapper);

  videoElement.append(infoWrapper);

  element.appendChild(videoElement);

  // var imageHeight = videoElement.offsetHeight - infoWrapper.offsetHeight;
  // console.log(imageHeight, videoElement.offsetHeight, infoWrapper.offsetHeight);
  // if (imageHeight * (16 / 9) > videoElement.offsetWidth) {
  //   thumbnailWrapper.style.height = videoElement.offsetWidth / (16 / 9) + "px";
  //   thumbnailWrapper.style.width = videoElement.offsetWidth + "px";
  // } else {
  //   thumbnailWrapper.style.height = imageHeight + "px";
  //   thumbnailWrapper.style.width = imageHeight * (16 / 9) + "px";
  // }

  var imageWidth = videoElement.offsetWidth;
  var imageHeight = imageWidth / (16 / 9);

  var maxHeight = videoElement.offsetHeight - infoWrapper.offsetHeight;

  if (element.style.overflowY == "hidden" && imageHeight > maxHeight) {
    imageHeight = maxHeight;
    imageWidth = imageHeight * (16 / 9);
  }

  thumbnailWrapper.style.width = imageWidth + "px";
  thumbnailWrapper.style.height = imageHeight + "px";
}

async function youtube_yt_video(elementId, ...parameters) {
  var element = document.getElementById(elementId);

  var id = parameters[0];
  var video = await fetchVideo(id);

  if (!video) return;

  var { duration, published, title, thumbnail, url, views, author } = video;
  var { name, url: author_url, thumbnail: author_thumbnail } = author;

  createVideoElement(element, {
    duration,
    published,
    title,
    thumbnail,
    url,
    views,
    name,
    author_url,
    author_thumbnail,
  });
}

async function youtube_yt_channel(elementId, ...parameters) {
  var element = document.getElementById(elementId);
  var id = parameters[0];
  var limit = parameters[1];
  var collumns = parameters[2] ?? 2;

  var videos = await fetchChannel(id, limit);

  if (!videos) return;

  var playlistWrapper = document.createElement("div");
  playlistWrapper.classList.add("youtube_playlist");

  playlistWrapper.style.gridTemplateColumns = `repeat(${collumns}, 1fr)`;

  element.append(playlistWrapper);
  videos.forEach((video) => {
    if (!video) return;

    var { duration, published, title, thumbnail, url, views, author } = video;
    var { name, url: author_url, thumbnail: author_thumbnail } = author;
    createVideoElement(playlistWrapper, {
      duration,
      published,
      title,
      thumbnail,
      url,
      views,
      name,
      author_url,
      author_thumbnail,
    });
  });
}

async function youtube_yt_latest(elementId, ...parameters) {
  var element = document.getElementById(elementId);
  var id = parameters[0];

  var video = await fetchLatest(id);
  if (!video) return;

  var { duration, published, title, thumbnail, url, views, author } = video;
  var { name, url: author_url, thumbnail: author_thumbnail } = author;
  createVideoElement(element, {
    duration,
    published,
    title,
    thumbnail,
    url,
    views,
    name,
    author_url,
    author_thumbnail,
  });
}

function youtube_yt_embed(elementId, ...parameters) {
  var element = document.getElementById(elementId);
  var videoId = parameters[0];
  var video = document.createElement("iframe");

  video.width = "100%";
  video.height = "100%";

  video.src = `https://www.youtube.com/embed/${videoId}`;
  video.classList.add("youtube_video_embed");
  video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; webshare";
  video.allowFullscreen = true;
  video.frameBorder = 0;
  element.append(video);
}

async function youtube_yt_latest_embed(elementId, ...parameters) {
  var element = document.getElementById(elementId);
  var channelId = parameters[0];

  var videoData = await fetchLatest(channelId);
  if (!videoData) return;

  var { id: videoId } = videoData;

  var video = document.createElement("iframe");

  video.width = "100%";
  video.height = "100%";

  video.src = `https://www.youtube.com/embed/${videoId}`;
  video.classList.add("youtube_video_embed");
  video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; webshare";
  video.allowFullscreen = true;
  video.frameBorder = 0;
  element.append(video);
}
