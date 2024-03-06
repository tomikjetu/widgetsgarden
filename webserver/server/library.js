import mongoose from "mongoose";
import { generateWidgetID, getUserName, getWidget } from "./accounts.js";
import { Library, Widget } from "./database.js";
import fs from "fs";

if (process.env.ENVIRONMENT == "production") setInterval(UpdateLibrary, 10 * 60 * 1000);

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
        dateUpdated: new Date()
      });
      await data.save();
      resolve();
    });
  });
}

export async function UpdateLibrary() {
  Library.findOne({}).then(async (data) => {
    for (var i = data.widgets.length - 1; i >= 0; i--) {
      var widgetReferrence = data.widgets[i];

      var dateUpdated = widgetReferrence.dateUpdated || 0;

      var widget = await getWidget(widgetReferrence.widgetId, widgetReferrence.userId);
      if (!widget) data.widgets.splice(i, 1);

      var dateModified = widget.dateModified;

      if(new Date(dateUpdated) > new Date(dateModified)) continue;

      widgetReferrence.displayName = widget.displayName;
      widgetReferrence.description = widget.description;
      widgetReferrence.userName = await getUserName(widget.userId)
      widgetReferrence.dateUpdated = new Date();
    }

    data.save();
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

export async function CopyWidget(widgetId, userId) {
  return new Promise((resolve) => {
    Library.findOne({}).then(async (data) => {
      var widgetReferrence = data.widgets.find((widget) => widget.widgetId == widgetId);
      if (!widgetReferrence) return resolve(false);
      var widget = await getWidget(widgetReferrence.widgetId, widgetReferrence.userId);
      if (!widget) return resolve(false);
      widget._id = new mongoose.Types.ObjectId();
      widget.userId = userId;
      widget.dateCreated = new Date();
      var newId = generateWidgetID(); 
      widget.widgetId = newId;
      await Widget.collection.insertOne(widget);
      resolve(newId);
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
function loadAssetsLibrary(){
  AssetsLibrary = [];
  var dir = fs.readdirSync("server/assets/library");
  dir.forEach((file)=>{
    AssetsLibrary.push({
      name: file.split(".")[0],
      assetId : file.split(".")[0]
    })
  });
}

export function getAssetsLibrary(){
  // Only load assets on start of the production server
  if (process.env.ENVIRONMENT == "development") loadAssetsLibrary();
  return AssetsLibrary;
}