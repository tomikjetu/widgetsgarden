import ytpl from "ytpl";
import ytdl from "ytdl-core";

async function fetchChannel(channelId, limit) {
  try {
    var channel = await ytpl(channelId);
    var playlist = await Promise.all(
      channel.items.slice(0, limit).map(async (item) => {
        return await fetchVideo(item.url);
      })
    );
    return playlist;
  } catch {
    return null;
  }
}

async function fetchVideo(videoId) {
  return new Promise(async (resolve) => {
    try {
      var info = await ytdl.getInfo(videoId);
      resolve({
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        url: info.videoDetails.video_url,
        views: info.videoDetails.viewCount,
        published: info.videoDetails.publishDate,
        duration: `${Math.floor(info.videoDetails.lengthSeconds / 60)}:${info.videoDetails.lengthSeconds % 60 < 10 ? `0${info.videoDetails.lengthSeconds % 60}` : info.videoDetails.lengthSeconds % 60}`,
        author: {
          url: info.videoDetails.author.channel_url,
          name: info.videoDetails.author.name,
          thumbnail: info.videoDetails.author.thumbnails[info.videoDetails.author.thumbnails.length - 1].url,
        },
      });
    } catch {
      resolve(null);
    }
  });
}

export default function YoutubeWidgetEndpoint(app) {
  app.get("/api/widgetapi/youtube/channel", async (req, res) => {
    var { channelId, limit } = req.query;
    if (!channelId) return res.json(null);
    if (!limit) limit = 3;
    var channel = await fetchChannel(channelId, limit);
    res.json(channel);
  });

  app.get("/api/widgetapi/youtube/video", async (req, res) => {
    var { videoId } = req.query;
    if (!videoId) return res.json(null);
    var video = await fetchVideo(videoId);
    res.json(video);
  });
}