import mongoose from "mongoose";
import { addIntroPoint, copyAsset, generateWidgetID, getUserName, getWidget, getWidgetPreview, getWidgets } from "./accounts.js";
import { Library, Widget } from "./database.js";
import fs from "fs";
import { hasScreenshot, takeLibraryScreenshot } from "./modules/library/Screenshot.js";
import sharp from "sharp";

if (process.env.ENVIRONMENT == "production") setInterval(UpdateLibrary, 10 * 60 * 1000);
setInterval(UpdateScreenshots, 10 * 60 * 1000);

export async function LibraryHasWidget(widgetId) {
  return new Promise((resolve) => {
    Library.findOne({}).then((data) => {
      resolve(data.widgets.filter((widget) => widget.widgetId == widgetId).length > 0);
    });
  });
}

export async function LibraryAddWidget(widget) {
  return new Promise((resolve) => {
    Library.findOne({}).then(async (data) => {
      data.widgets.push({
        userId: widget.userId,
        userName: await getUserName(widget.userId),
        widgetId: widget.widgetId,
        displayName: widget.displayName,
        description: widget.description,
        dateAdded: new Date(),
        dateUpdated: new Date(),
      });
      await data.save();
      resolve();
    });
  });
}

export async function UpdateScreenshots() {
  Widget.find({}).then(async (widgets) => {
    for (var i = 0; i < widgets.length; i++) {
      const widget = widgets[i];

      var dateScreenshoted = hasScreenshot(widget.widgetId);
      var dateModified = widget.dateModified || 0;

      if (new Date(dateScreenshoted) > new Date(dateModified)) continue;

      await UpdateScreenshot(widget.widgetId);
    }
  });
}

export async function UpdateScreenshot(widgetId) {
  console.log(`Taking Screenshot for ${widget.widgetId}`);
  await takeLibraryScreenshot(widgetId);
  updateWatermark(widgetId);
}

async function updateWatermark(widgetId) {
  if (!hasScreenshot(widgetId)) return;
  var path = `./server/assets/screenshots/${widgetId}.png`;

  sharp(path)
    .raw()
    .toBuffer(async (err, data, info) => {
      if (err) return console.log("ERROR Capturing Watermark ", err);
      var { width, height, channels } = info;
      if (channels < 3) return;

      var watermarkHeight = Math.min(24, parseInt(width) / 8);
      var watermarkWidth = watermarkHeight * 4.2;
      var marginRight = 10;
      var marginBottom = 5;

      var sum = [0, 0, 0];
      var amount = 0;
      for (var x = Math.floor(width - watermarkWidth - marginRight); x < width - marginRight; x++) {
        for (var y = Math.floor(height - watermarkHeight - marginBottom); y < height - marginBottom; y++) {
          var index = (y * width + x) * channels;
          sum[0] += data[index];
          sum[1] += data[index + 1];
          sum[2] += data[index + 2];
          amount++;
        }
      }
      var avg = [Math.floor(sum[0] / amount), Math.floor(sum[1] / amount), Math.floor(sum[2] / amount)];
      var shade = (avg[0] + avg[1] + avg[2]) / 3;

      var textColor = shade > 128 ? "#000000" : "#FFFFFF";

      var widget = await getWidgetPreview(widgetId);
      widget.watermarkColor = textColor;
      widget.dateScreenshoted = new Date();
      widget.save();
    });
}

export async function UpdateLibrary() {
  console.log("Updating Library...");
  var updatetCount = 0;
  Library.findOne({}).then(async (data) => {
    for (var i = data.widgets.length - 1; i >= 0; i--) {
      var widgetReferrence = data.widgets[i];

      var dateUpdated = widgetReferrence.dateUpdated || 0;

      var widget = await getWidget(widgetReferrence.widgetId, widgetReferrence.userId);
      if (widget == null) data.widgets.splice(i, 1);

      var dateModified = widget.dateModified || 0;

      if (new Date(dateUpdated) > new Date(dateModified)) continue;

      console.log(`Updating Widget: ${widgetReferrence.displayName} (${widgetReferrence.widgetId})`);
      updatetCount++;

      widgetReferrence.displayName = widget.displayName;
      widgetReferrence.description = widget.description;
      widgetReferrence.userName = await getUserName(widget.userId);
      widgetReferrence.dateUpdated = new Date();
    }

    console.log(`Library Updated [${updatetCount}/${data.widgets.length}]`);
    if (updatetCount > 0) {
      data.markModified("widgets");
      await data.save();
    }
  });
}

export async function LibraryRemoveWidget(widgetId) {
  return new Promise((resolve) => {
    Library.findOne({}).then(async (data) => {
      data.widgets = data.widgets.filter((widget) => widget.widgetId != widgetId);
      await data.save();
      resolve();
    });
  });
}

export async function CopyWidget(widgetId, User) {
  console.log(`Copying Widget: ${widgetId} for user ${User.uuid}`);
  return new Promise((resolve) => {
    Library.findOne({}).then(async (data) => {
      var widgetReferrence = data.widgets.find((widget) => widget.widgetId == widgetId);
      if (!widgetReferrence) return resolve(false);
      var widget = await getWidget(widgetReferrence.widgetId, widgetReferrence.userId);
      if (!widget) return resolve(false);
      widget._id = new mongoose.Types.ObjectId();
      widget.userId = User.uuid;
      widget.dateCreated = new Date();
      var newId = generateWidgetID();
      widget.widgetId = newId;

      var AssetPath = process.env.API_URL + "/assets/image/";
      var AssetsRegexp = new RegExp(`${AssetPath}(?<id>.+)`, "g");

      var idMap = {};

      for await (const element of widget.data) {
        switch (element.type) {
          case "Image":
            var match = AssetsRegexp.exec(element.data.url);
            if (match) {
              var assetId = match.groups.id;
              if (idMap[assetId]) {
                element.data.url = AssetPath + idMap[assetId];
                break;
              }
              var newId = await copyAsset(User.uuid, assetId);
              console.log(`Copied Asset: ${assetId} -> ${newId}`);
              idMap[assetId] = newId;
              element.data.url = AssetPath + newId;
            }
            break;
          case "Button":
            var match = AssetsRegexp.exec(element.data.icon);
            if (match) {
              var assetId = match.groups.id;
              if (idMap[assetId]) {
                element.data.icon = AssetPath + idMap[assetId];
                break;
              }
              var newId = await copyAsset(User.uuid, assetId);
              console.log(`Copied Asset: ${assetId} -> ${newId}`);
              idMap[assetId] = newId;
              element.data.icon = AssetPath + newId;
            }
            break;
        }
      }

      await Widget.collection.insertOne(widget);
      resolve(newId);
      addIntroPoint(User, 0);
    });
  });
}

export async function GetLibrary() {
  return new Promise((resolve) => {
    Library.findOne({}).then(async (data) => {
      resolve(data.widgets);
    });
  });
}

var AssetsLibrary = [];
loadAssetsLibrary();
function loadAssetsLibrary() {
  AssetsLibrary = [];
  var dir = fs.readdirSync("server/assets/library");
  dir.forEach((file) => {
    AssetsLibrary.push({
      name: file.split(".")[0],
      assetId: file.split(".")[0],
    });
  });
}

export function getAssetsLibrary() {
  // Only load assets on start of the production server
  if (process.env.ENVIRONMENT == "development") loadAssetsLibrary();
  return AssetsLibrary;
}
