import mongoose, { Schema } from "mongoose";

const accounts = mongoose.createConnection(process.env.ACCOUNTS_DATABASE);
const widgets = mongoose.createConnection(process.env.WIDGETS_DATABASE);
const assets = mongoose.createConnection(process.env.ASSETS_DATABASE);
accounts.on("connected", () => {
  console.log("Connected To MongoDB (Accounts)");
});

widgets.on("connected", () => {
  console.log("Connected To MongoDB (Widgets)");
});

assets.on("connected", () => {
  console.log("Connected To MongoDB (Assets)");
});

const AccessSchema = new Schema({
  userId: String,
  apiKey: String,
  allowedReferrers: ["http://localhost:5050"],
  restrictedReferrers: [],
  allowAll: Boolean,
  usage: {
    loaded: [],
    stored: [],
    overview: {
      authorized: {},
      restricted: {},
    },
  },
});

const UserSchema = new Schema({
  authenticationMethod: String,

  uuid: String,
  email: String,
  username: String,

  guide: Object,

  admin: Boolean,
  plan: String,

  password: String,
  registerIP: String,
  userSince: Date,
});

const MessagesSchema = new Schema({
  userId: String,
  messages: [],
});

export class Message {
  generateMessageId() {
    var d = new Date().getTime();
    var id = "Mxxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return id;
  }
  constructor(title, text, link, important) {
    this.important = important ?? false;
    this.read = false;
    this.deleted = false;
    this.archived = false;

    this.title = title;
    this.text = text;
    this.link = link;

    this.messageDate = new Date().getTime();
    this.messageId = this.generateMessageId();
  }
}

const WidgetSchema = new Schema({
  userId: String,
  widgetId: String,
  displayName: String,
  description: String,

  dateCreated: Date,
  dateModified: Date,
  dateScreenshoted: Date,

  watermarkColor: String,

  data: {},
  analytics: {
    collected: [],
    overview: {},
  },
});

const AnalyticsSchema = new Schema({
  userId: String,
  enabled: Boolean,
  collected: [], // Every collected analytic
  overview: {},
  lastAnalysis: Date,
});

const AssetsSchema = new Schema({
  userId: String,
  assets: [],
  /* ASSET
    {
      uuid: String
      name: String
      filesize: Int32
    }
  */
});

var PluginsSchema = new Schema({ plugins: [] });

var LibrarySchema = new Schema({
  widgets: [],
});

export var User = accounts.model("User", UserSchema, "users");
export var Access = accounts.model("Access", AccessSchema, "access");
export var Widget = accounts.model("Widget", WidgetSchema, "widgets");
export var Analytics = accounts.model("Analytics", AnalyticsSchema, "analytics");
export var Messages = accounts.model("Messages", MessagesSchema, "messages");

export var DevelopmentAssets = assets.model("DevelopmentAssets", AssetsSchema, "development");
export var ProductionAssets = assets.model("ProductionAssets", AssetsSchema, "production");

export var WidgetPluginsDevelopment = widgets.model("development", PluginsSchema, "development");
export var WidgetPluginsProduction = widgets.model("production", PluginsSchema, "production");
export var Library = widgets.model("libary", LibrarySchema, "library");
