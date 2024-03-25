// ░██╗░░░░░░░██╗██╗██████╗░░██████╗░███████╗████████╗░██████╗
// ░██║░░██╗░░██║██║██╔══██╗██╔════╝░██╔════╝╚══██╔══╝██╔════╝
// ░╚██╗████╗██╔╝██║██║░░██║██║░░██╗░█████╗░░░░░██║░░░╚█████╗░
// ░░████╔═████║░██║██║░░██║██║░░╚██╗██╔══╝░░░░░██║░░░░╚═══██╗
// ░░╚██╔╝░╚██╔╝░██║██████╔╝╚██████╔╝███████╗░░░██║░░░██████╔╝
// ░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░░╚═════╝░╚══════╝░░░╚═╝░░░╚═════╝░

import fs from "fs";
import { Message, WidgetPluginsDevelopment, WidgetPluginsProduction } from "../database.js";
import { verifyApiKey, verifyAccess, getUserFromApiKey, isRestrictedDomain, addRestrictedDomain, sendMessage, onLoad, DOMAINREGEXP, getWidget, getUserSerialization, uploadAsset, getAssets, getAsset, isLogged, removeAsset, getWidgetPreview } from "../accounts.js";
import { getAssetsLibrary } from "../library.js";
import { AnalyticRecieved,isAnalyticsEnabled } from "../modules/analytics/Misc.js";

// Checks if a api key is present
export async function isVerified(req) {
  const apiKey = req.query.apiKey;
  const verified = await verifyApiKey(apiKey, req.get("referrer"));
  return verified;
}

export async function isVerifiedMiddleware(req, res, next) {
  const apiKey = req.query.apiKey;
  var verified = await isVerified(req);
  if (!verified) return res.render("403", { apiKey, forbidden: true }); //Forbidden, invalid apiKey - styles work, default background only
  next();
}

// Checks if referrer is in access list
export async function accessGranted(req) {
  const apiKey = req.query.apiKey;
  if (!apiKey) return false;
  // Referrer has to be localhost or a domain
  // file:// is not valid referrer, it's never sent 
  var Referrer = req.get("referrer") || "";

  if (!Referrer) return false;

  var Domain = Referrer.match(DOMAINREGEXP);  
  if (Domain == null) return false;
  Domain = Domain[0];

  if (apiKey == "preview") {
    var SERVER_DOMAIN = process.env.API_URL.match(DOMAINREGEXP)[0];
    var WEBSITE_DOMAIN = process.env.WEBSITE_URL.match(DOMAINREGEXP)[0];
    if (Domain == SERVER_DOMAIN || Domain == WEBSITE_DOMAIN) return true;
    return false;
  }

  const allowed = await verifyAccess(req, apiKey);
  const User = await getUserFromApiKey(apiKey);
  if (!User) return false;
  if (!allowed) {
    var domainRestricted = await isRestrictedDomain(User.uuid, Domain);
    if (!domainRestricted) {
      await addRestrictedDomain(User.uuid, Domain);
      await sendMessage(User.uuid, new Message("Unauthorized Access", `${Domain} tried accesing your apikey. You can allow it from access dashboard.`, "/dashboard/access"));
    }
    return false;
  }
  return true;
}

export async function accessGrantedMiddleware(req, res, next) {
  const apiKey = req.query.apiKey;
  var granted = await accessGranted(req);
  if (!granted) return res.render("403", { apiKey, forbidden: true }); //Forbidden, stolen apikey?/ invalid domain - styles work, default background)
  next();
}

// Referrer has to be widgetsgarden
export function canAccess(req) {
  const url = req.get("referrer") || "";
  var domain = url.match(DOMAINREGEXP);
  var SERVER_DOMAIN = process.env.API_URL.match(DOMAINREGEXP)[0];
  if (!domain) return false;
  if (domain[0] == SERVER_DOMAIN) return true;
  return false;
}

export function canAccessMiddleware(req, res, next) {
  const apiKey = req.query.apiKey;
  var access = canAccess(req);
  if (!access) res.render("403", { apiKey, forbidden: true });
  else next();
}

export var SECRETS = {};
export var ORIGINS = {};
export default function (app) {
  // DON'T VERIFY APIKEY HERE
  // IF script isn't loaded, widgets aren't loaded at all
  // Load 404 page
  // MAY BE CHANGED IN PRODUCTION IF NEEDED (IF SPAM)
  app.get("/api/widgetsgarden.js", async (req, res) => {
    const apiKey = req.query.apiKey;
    onLoad(req, apiKey);
    var script = fs.readFileSync("./server/api/widgetsgarden.js", "utf-8");
    script = script.replace("AUTHENTICATION_PLACEHOLDER", apiKey);
    script = script.replace("SERVER_PLACEHOLDER", process.env.API_URL);
    res.setHeader("Content-type", "text/javascript");
    res.send(script);
    
  });

  app.get("/api/widgetsgarden.css", async (req, res) => {
    var styles = fs.readFileSync("./server/api/widgetgarden.css", "utf-8");
    res.setHeader("Content-type", "text/css");
    res.send(styles);
  });

  app.get("/api/styles", async (req, res) => {
    const apiKey = req.query.apiKey;
    res.setHeader("Content-type", "text/css");
    var file = fs.readFileSync(`./server/api/files/widget.css`, "utf-8");
    file = file.replaceAll("AUTHENTICATION_PLACEHOLDER", apiKey);
    res.send(file);
  });

  app.get("/api/widget", async (req, res) => {
    const apiKey = req.query.apiKey;
    const widgetId = req.query.widgetId;

    var verified = await isVerified(req);
    var access = await accessGranted(req);

    // Api key is invalid or invalid domain
    if (!verified || !access) {
      return res.render("403", {
        apiKey,
        widgetId,
        forbidden: true,
      });
    }

    var widget;
    var userId;

    if (apiKey == "preview") {
      widget = await getWidgetPreview(widgetId);
      if (!widget) return res.render("404", { apiKey });
    } else {
      const user = await getUserFromApiKey(apiKey);
      if (!user) return res.render("403", { apiKey, forbidden: true, widgetId });
      userId = user.uuid;
      widget = await getWidget(widgetId, userId);
      if (!widget) return res.render("404", { apiKey, widgetId });
      // TODO premium account remove watermark
    }
    // Widget sucessfully loaded

    var secret = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString("16");
    SECRETS[secret] = widgetId;
    ORIGINS[secret] = {
      referrer: req.get("referer"),
      path: req.query.path,
    };

    res.render("widget", {
      data: widget.data || {},
      apiKey,
      widgetId,
      secret,
      WEBSITE_URL: process.env.WEBSITE_URL,
    });

    AnalyticRecieved(userId, widgetId, req, "loadWidget", null, ORIGINS[secret]);
  });

  app.get("/api/plugins/data", async (req, res) => {
    if (process.env.ENVIRONMENT == "production") {
      WidgetPluginsProduction.findOne({}).then((data) => {
        res.json(data.plugins);
      });
    } else {
      WidgetPluginsDevelopment.findOne({}).then((data) => {
        res.json(data.plugins);
      });
    }
  });

  app.get("/api/widget/data", async (req, res) => {
    const widgetId = req.query.widgetId;
    const apiKey = req.query.apiKey;
    const secret = req.query.secret;

    var widget;
    var userId;

    if (apiKey == "preview") widget = await getWidgetPreview(widgetId);
    else {
      const user = await getUserFromApiKey(apiKey);
      if (!user) return res.send({ authorized: false, widgetId });
      userId = user.uuid;
      widget = await getWidget(widgetId, userId);
    }
    if (!widget) return res.send({ authorized: false, widgetId });

    widget = JSON.parse(JSON.stringify(widget));

    if (userId) widget.analytics = await isAnalyticsEnabled(userId);
    else widget.analytics = false;

    var verified = await isVerified(req);
    var access = canAccess(req); // iframe referrer
    var pass = SECRETS[secret] == widgetId; // parent referrer
    delete SECRETS[secret];

    if (!verified || !access || !pass)
      return res.send({
        widgetId,
        authorized: false,
      });

    widget.authorized = true;
    res.send(widget);
  });

  // any path with /api/[files/backgrounds]/.../.../.../file.extension
  // accessable from within the iframe
  app.get(/api\/(files)([\/]{1}.*\/?)/, canAccessMiddleware, async (req, res) => {
    sendFile(req, res);
  });

  // accesable from the page if apiKey is present
  app.get(/api\/(scripts)([\/]{1}.*\/?)/, isVerifiedMiddleware, async (req, res) => {
    sendFile(req, res);
  });

  async function sendFile(req, res) {
    var apiKey = req.query.apiKey;
    var path = decodeURI(req.path);
    var pathParts = path.split("/");
    var fileParts = pathParts[pathParts.length - 1].split(".");
    var extension = fileParts[fileParts.length - 1];

    var contentType, encoding;
    switch (extension) {
      case "gif":
        contentType = "image/gif";
        encoding = "Base64";
        break;
      case "png":
        contentType = "image/png";
        encoding = "Base64";
        break;
      case "jpeg":
      case "jpg":
        contentType = "image/jpeg";
        encoding = "Base64";
        break;
      case "svg":
        contentType = "image/svg+xml";
        encoding = "Base64";
        break;
      case "css":
        contentType = "text/css";
        encoding = "utf-8";
        break;
      case "js":
        contentType = "text/javascript";
        encoding = "utf-8";
        break;
      default:
        return res.end(400);
    }

    res.setHeader("Content-type", contentType);
    var fileUrl = `./server${path}`;
    var exists = fs.existsSync(fileUrl);
    if (!exists) return res.sendStatus(404);
    var file = fs.readFileSync(fileUrl, encoding);
    var code = file.replace(/AUTHENTICATION_PLACEHOLDER/g, apiKey);
    return res.end(code, encoding);
  }
  /*
  ██╗███╗░░░███╗░█████╗░░██████╗░███████╗░██████╗
  ██║████╗░████║██╔══██╗██╔════╝░██╔════╝██╔════╝
  ██║██╔████╔██║███████║██║░░██╗░█████╗░░╚█████╗░
  ██║██║╚██╔╝██║██╔══██║██║░░╚██╗██╔══╝░░░╚═══██╗
  ██║██║░╚═╝░██║██║░░██║╚██████╔╝███████╗██████╔╝
  ╚═╝╚═╝░░░░░╚═╝╚═╝░░╚═╝░╚═════╝░╚══════╝╚═════╝░*/

  app.post("/api/assets", isLogged, async function (req, res) {
    const user = getUserSerialization(req);
    var asset = req.files["asset"];

    await uploadAsset(asset, user.uuid);

    res.sendStatus(200);
  });

  app.get("/api/assets", isLogged, async function (req, res) {
    const user = getUserSerialization(req);
    var assets = {
      user: await getAssets(user.uuid),
      library: getAssetsLibrary(),
    };
    res.json(assets);
  });

  app.get("/api/assets/image/:ID", async (req, res) => {
    const ID = req.params.ID;

    var asset = await getAsset(ID);
    if (!asset) return res.sendStatus(404);
    var type = asset.mimetype.split("/")[1];
    var fileUrl = `server/assets/files/${ID}.${type.replace("svg+xml", "svg")}`;
    var exists = fs.existsSync(fileUrl);
    if (!exists) return res.sendStatus(404);

    var file = fs.readFileSync(fileUrl, "Base64");
    res.setHeader("Content-type", asset.mimetype);
    return res.end(file, "Base64");
  });

  app.delete("/api/assets/:ID", isLogged, async (req, res) => {
    const userId = getUserSerialization(req);
    const assetId = req.params.ID;
    await removeAsset(userId.uuid, assetId);
    res.json(200);
  });

  app.get("/api/assets/thumbnail/:ID", async (req, res) => {
    const ID = req.params.ID;

    var asset = await getAsset(ID);
    if (!asset) return res.sendStatus(404);
    var type = asset.mimetype.split("/")[1];
    var fileUrl = `server/assets/thumbnails/${ID}.${type.replace("svg+xml", "svg")}`;
    var exists = fs.existsSync(fileUrl);
    if (!exists) return res.sendStatus(404);

    var file = fs.readFileSync(fileUrl, "Base64");
    res.setHeader("Content-type", asset.mimetype);
    return res.end(file, "Base64");
  });

  app.get("/api/assets/library/:ID", async (req, res) => {
    const ID = req.params.ID;

    var fileUrl = `server/assets/library/${ID}.png`;
    var exists = fs.existsSync(fileUrl);
    if (!exists) return res.sendStatus(404);

    var file = fs.readFileSync(fileUrl, "Base64");
    res.setHeader("Content-type", "image/png");
    return res.end(file, "Base64");
  });

  app.get("/api/assets/library/plugin/:ID", async (req, res) => {
    const ID = req.params.ID;

    var fileUrl = `server/assets/editor/plugins/${ID}.png`;
    var exists = fs.existsSync(fileUrl);
    if (!exists) fileUrl = "server/assets/editor/plugins/missing.png";

    exists = fs.existsSync(fileUrl);
    if (!exists) return res.sendStatus(404);

    var file = fs.readFileSync(fileUrl, "Base64");
    res.setHeader("Content-type", "image/png");
    return res.end(file, "Base64");
  });

  app.get("/api/assets/library/function/:ID", async (req, res) => {
    const ID = req.params.ID;

    var fileUrl = `server/assets/editor/containers/${ID}.png`;
    var exists = fs.existsSync(fileUrl);
    if (!exists) fileUrl = "server/assets/editor/containers/missing.png";

    exists = fs.existsSync(fileUrl);
    if (!exists) return res.sendStatus(404);

    var file = fs.readFileSync(fileUrl, "Base64");
    res.setHeader("Content-type", "image/png");
    return res.end(file, "Base64");
  });
}
