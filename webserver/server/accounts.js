import { Access, User, Messages, Message, Widget, Analytics, DevelopmentAssets, ProductionAssets } from "./database.js";
import { hashPassword } from "./passport.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export function isLogged(req, res, next) {
  const User = getUserSerialization(req);
  if (!User) return res.redirect("/auth"); // TODO this path doesn't even exist / CORS Doesn't support anything outside /api
  next();
}

export async function isAdmin(req, res, next) {
  const User = await getUser(req);
  if (!User || !User.admin) return res.redirect("/"); // TODO RETURN ERROR CODE
  next();
}

export async function getUser(req) {
  var uuid = getUserSerialization(req)?.uuid;
  if (!uuid) return null;
  return new Promise(async (resolve) => {
    User.findOne({ uuid }).then((user) => {
      resolve(user);
    });
  });
}

export function getUserSerialization(req) {
  return req.session?.passport?.user;
}

/*
██╗░░░██╗░██████╗░█████╗░░██████╗░███████╗
██║░░░██║██╔════╝██╔══██╗██╔════╝░██╔════╝
██║░░░██║╚█████╗░███████║██║░░██╗░█████╗░░
██║░░░██║░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░
╚██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗
░╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝*/

export async function onLoad(req, apiKey) {
  if (!(await verifyApiKey(apiKey))) return;
  var authorized = await verifyAccess(req, apiKey);
  Access.findOne({ apiKey }).then(async (access) => {
    if (!access?.usage) access.usage = {};
    if (!access.usage.loaded) access.usage.loaded = [];
    access.usage.loaded.push({
      timestamp: new Date().toLocaleString("en-US", { timeZone: "Europe/Bratislava" }),
      ip: req.ip,
      referrer: req.get("referrer"),
      authorized,
    });
    access.save();
  });
}

/*
░█████╗░██╗░░░██╗████████╗██╗░░██╗███████╗███╗░░██╗████████╗██╗░█████╗░░█████╗░████████╗██╗░█████╗░███╗░░██╗
██╔══██╗██║░░░██║╚══██╔══╝██║░░██║██╔════╝████╗░██║╚══██╔══╝██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔══██╗████╗░██║
███████║██║░░░██║░░░██║░░░███████║█████╗░░██╔██╗██║░░░██║░░░██║██║░░╚═╝███████║░░░██║░░░██║██║░░██║██╔██╗██║
██╔══██║██║░░░██║░░░██║░░░██╔══██║██╔══╝░░██║╚████║░░░██║░░░██║██║░░██╗██╔══██║░░░██║░░░██║██║░░██║██║╚████║
██║░░██║╚██████╔╝░░░██║░░░██║░░██║███████╗██║░╚███║░░░██║░░░██║╚█████╔╝██║░░██║░░░██║░░░██║╚█████╔╝██║░╚███║
╚═╝░░╚═╝░╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝╚══════╝╚═╝░░╚══╝░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚══╝*/

function generateAPIKEY() {
  var d = new Date().getTime();

  var uuid = "wgxxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export async function getApiKey(UserID) {
  return new Promise((resolve, reject) => {
    Access.findOne({ userId: UserID }).then(async (access) => {
      resolve(access.apiKey);
    });
  });
}

export async function getAccess(userId) {
  return new Promise((resolve, reject) => {
    Access.findOne({ userId }).then(async (access) => {
      resolve(access);
    });
  });
}

export async function getUserFromApiKey(apiKey) {
  return new Promise((resolve, reject) => {
    Access.findOne({ apiKey }).then(async (access) => {
      if (access == null) return resolve(null);
      User.findOne({ uuid: access.userId }).then(async (user) => {
        resolve(user);
      });
    });
  });
}

/*
██╗░░░██╗░██████╗███████╗██████╗░
██║░░░██║██╔════╝██╔════╝██╔══██╗
██║░░░██║╚█████╗░█████╗░░██████╔╝
██║░░░██║░╚═══██╗██╔══╝░░██╔══██╗
╚██████╔╝██████╔╝███████╗██║░░██║
░╚═════╝░╚═════╝░╚══════╝╚═╝░░╚═╝*/

export async function getUserName(userId) {
  return new Promise((resolve) => {
    User.findOne({ uuid: userId }).then(async (user) => {
      resolve(user.username);
    });
  });
}

/*
██╗░░░░░░█████╗░░██████╗░██╗███╗░░██╗
██║░░░░░██╔══██╗██╔════╝░██║████╗░██║
██║░░░░░██║░░██║██║░░██╗░██║██╔██╗██║
██║░░░░░██║░░██║██║░░╚██╗██║██║╚████║
███████╗╚█████╔╝╚██████╔╝██║██║░╚███║
╚══════╝░╚════╝░░╚═════╝░╚═╝╚═╝░░╚══╝*/

function generateUserId() {
  var d = new Date().getTime();

  var uuid = "uxxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export async function createLocalAccount(req, res) {
  var { email, username, password } = req.body;
  var existing = false,
    invalid = false,
    otherStrategy = false;

  if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) invalid = true;
  if (!username.match(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/)) invalid = true;
  if (invalid) return res.send("error:Invalid Request"); //Invalid Request

  await User.findOne({ email }).then(async (user) => {
    if (user) {
      existing = true;
      if (user.authenticationMethod != "local") otherStrategy = true;
    }
  });
  await User.findOne({ username }).then(async (user) => {
    if (user) existing = true;
  });
  if (otherStrategy) return res.send("error: This account uses another sign-in method.");
  if (existing) return res.send("error:User already exists");

  password = hashPassword(password, 10);
  const newUser = new User({ authenticationMethod: "local", uuid: generateUserId(), email, username, password, registerIP: req.ip, userSince: new Date() });
  await newUser.save();

  const UserAccess = new Access({ userId: newUser.uuid, apiKey: generateAPIKEY(), usage: [] });
  await UserAccess.save();

  console.log(`Created an account for ${newUser.username}!`);
  sendMessage(newUser.uuid, new Message("Welcome to WidgetsGarden!", "Welcome to WdigetGarden. Import your first Widget!", "/dashboard/widgets")); //TODO load welcome message from database
  return newUser;
}

export async function createGoogleAccount(req, email, username) {
  const newUser = new User({ authenticationMethod: "google", uuid: generateUserId(), email, username, registerIP: req.ip, userSince: new Date() });
  await newUser.save();

  const UserAccess = new Access({ userId: newUser.uuid, apiKey: generateAPIKEY(), usage: [] });
  await UserAccess.save();

  console.log(`Created google account for ${username}`);
  sendMessage(newUser.uuid, new Message("Welcome to WidgetsGarden", "Welcome to WdigetGarden. Import your first Widget!", "/dashboard/widgets")); //TODO load welcome message from database
  return newUser;
}

export async function localLogIn(req, res, user, code) {
  req.logIn(user, (err) => {
    if (err) return res.send(`error:${err}`);
    res.send(code);
    console.log(`${user.username} logged in!`);
  });
}

/*
░█████╗░██████╗░██╗
██╔══██╗██╔══██╗██║
███████║██████╔╝██║
██╔══██║██╔═══╝░██║
██║░░██║██║░░░░░██║
╚═╝░░╚═╝╚═╝░░░░░╚═╝*/

// If api key = preview, checks if referrer is widgetsgarden
export async function verifyApiKey(apiKey, referrer) {
  if (apiKey == "preview") {
    if (!referrer) return false;
    var Domain = referrer.match(DOMAINREGEXP);
    var SERVER_DOMAIN = process.env.API_URL.match(DOMAINREGEXP)[0];
    var WEBSITE_DOMAIN = process.env.WEBSITE_URL.match(DOMAINREGEXP)[0];
    if (!Domain) return false;
    if (Domain[0] == SERVER_DOMAIN || Domain[0] == WEBSITE_DOMAIN) return true;
    return false;
  }
  return new Promise((resolve, reject) => {
    Access.exists({ apiKey }).then(async (access) => {
      if (access) resolve(true);
      else resolve(false);
    });
  });
}

// Checks if referrer is in access list
export async function verifyAccess(req, apiKey) {
  return new Promise((resolve, reject) => {
    Access.findOne({ apiKey }).then(async (access) => {
      if (access) {
        var url = req.get("referrer");
        if (!url) return resolve(false);
        var domain = url.match(DOMAINREGEXP);
        if (!domain) return resolve(false);
        domain = domain[0];
        if (access.allowedReferrers?.includes(domain)) resolve(true);
        else if (access.allowedReferrers?.includes(domain + "/")) resolve(true);
        else resolve(false);
      } else resolve(false);
    });
  });
}

/*
██╗░░░██╗███████╗██████╗░██╗███████╗██╗░█████╗░░█████╗░████████╗██╗░█████╗░███╗░░██╗
██║░░░██║██╔════╝██╔══██╗██║██╔════╝██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔══██╗████╗░██║
╚██╗░██╔╝█████╗░░██████╔╝██║█████╗░░██║██║░░╚═╝███████║░░░██║░░░██║██║░░██║██╔██╗██║
░╚████╔╝░██╔══╝░░██╔══██╗██║██╔══╝░░██║██║░░██╗██╔══██║░░░██║░░░██║██║░░██║██║╚████║
░░╚██╔╝░░███████╗██║░░██║██║██║░░░░░██║╚█████╔╝██║░░██║░░░██║░░░██║╚█████╔╝██║░╚███║
░░░╚═╝░░░╚══════╝╚═╝░░╚═╝╚═╝╚═╝░░░░░╚═╝░╚════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚══╝*/

export const DOMAINREGEXP = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}(:[0-9]{1,})?|localhost:[0-9]{1,}/;

export async function getDomains(userID) {
  var access = await getAccess(userID);
  return {
    allowed: access.allowedReferrers,
    restricted: access.restrictedReferrers,
  };
}

//Allow the domain
//If domain was restrited - remove it
export async function addAllowedDomain(userID, url) {
  return new Promise(async (resolve, reject) => {
    var access = await getAccess(userID);
    if (!access.allowedReferrers) access.allowedReferrers = [];
    var domain = url.match(DOMAINREGEXP);
    if (domain) {
      domain = domain[0];
      access.allowedReferrers.push(domain);
      await access.save();
      await removeRestrictedDomain(userID, domain);
      resolve(true);
    } else resolve(false);
  });
}

//remove allowed domain
//add it to restricted
export async function removeAllowedDomain(userID, domain) {
  return new Promise(async (resolve, reject) => {
    var access = await getAccess(userID);
    if (!access.allowedReferrers) access.allowedReferrers = [];
    var index = access.allowedReferrers.indexOf(domain);
    if (index !== -1) {
      access.allowedReferrers.splice(index, 1);
      await access.save();
      await addRestrictedDomain(userID, domain);
      resolve(true);
    } else resolve(false);
  });
}

//add restricted domain
export async function addRestrictedDomain(userID, domain) {
  var access = await getAccess(userID);
  if (!access.restrictedReferrers) access.restrictedReferrers = [];
  if (!access.restrictedReferrers.includes(domain)) {
    access.restrictedReferrers.push(domain);
    await access.save();
  }
}

export async function isRestrictedDomain(userId, domain) {
  if (!domain) return false;
  var access = await getAccess(userId);
  return access.restrictedReferrers?.includes(domain);
}

//removes the domain from the restricted list
export async function removeRestrictedDomain(userID, domain) {
  return new Promise(async (resolve, reject) => {
    var access = await getAccess(userID);
    if (!access.restrictedReferrers) access.restrictedReferrers = [];
    var index = access.restrictedReferrers.indexOf(domain);
    if (index !== -1) {
      access.restrictedReferrers.splice(index, 1);
      await access.save();
      resolve(true);
    }
    resolve(false);
  });
}

/*
███╗░░░███╗███████╗░██████╗░██████╗░█████╗░░██████╗░███████╗░██████╗
████╗░████║██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝░██╔════╝██╔════╝
██╔████╔██║█████╗░░╚█████╗░╚█████╗░███████║██║░░██╗░█████╗░░╚█████╗░
██║╚██╔╝██║██╔══╝░░░╚═══██╗░╚═══██╗██╔══██║██║░░╚██╗██╔══╝░░░╚═══██╗
██║░╚═╝░██║███████╗██████╔╝██████╔╝██║░░██║╚██████╔╝███████╗██████╔╝
╚═╝░░░░░╚═╝╚══════╝╚═════╝░╚═════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝╚═════╝░*/

export async function getMessagesData(userId) {
  return new Promise((resolve, reject) => {
    Messages.findOne({ userId }).then(async (messages) => {
      if (!messages) {
        const newMessages = new Messages({ userId, messages: [] });
        await newMessages.save();
        resolve(newMessages);
      } else resolve(messages);
    });
  });
}

export async function getMessages(userId) {
  var messages = await getMessagesData(userId);
  return messages.messages.filter((message) => message.deleted == false);
}

export async function sendMessage(userId, message) {
  var messages = await getMessagesData(userId);
  messages.messages.push(message);
  await messages.save();
}

export async function readMessage(userId, id) {
  var messages = await getMessagesData(userId);
  var index = messages.messages.findIndex((message) => message.messageId == id);
  if (index < 0) return;
  var message = messages.messages[index];
  message.read = true;
  messages.messages.set(index, message);
  await messages.save();
}

export async function deleteMessage(userId, id) {
  var messages = await getMessagesData(userId);
  var index = messages.messages.findIndex((message) => message.messageId == id);
  if (index < 0) return;
  var message = messages.messages[index];

  if (message.archived) message.deleted = true;
  else message.archived = true;

  messages.messages.set(index, message);
  await messages.save();
}

/*
░██╗░░░░░░░██╗██╗██████╗░░██████╗░███████╗████████╗░██████╗
░██║░░██╗░░██║██║██╔══██╗██╔════╝░██╔════╝╚══██╔══╝██╔════╝
░╚██╗████╗██╔╝██║██║░░██║██║░░██╗░█████╗░░░░░██║░░░╚█████╗░
░░████╔═████║░██║██║░░██║██║░░╚██╗██╔══╝░░░░░██║░░░░╚═══██╗
░░╚██╔╝░╚██╔╝░██║██████╔╝╚██████╔╝███████╗░░░██║░░░██████╔╝
░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░░╚═════╝░╚══════╝░░░╚═╝░░░╚═════╝░*/

export function generateWidgetID() {
  var d = new Date().getTime();

  var uuid = "wxxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export async function getWidgets(userId) {
  return new Promise((resolve, reject) => {
    Widget.find({ userId }).then(async (widgets) => {
      resolve(widgets);
    });
  });
}

export async function getWidget(widgetId, userId) {
  return new Promise((resolve, reject) => {
    Widget.findOne({ widgetId, userId }).then(async (widget) => {
      resolve(widget);
    });
  });
}

export async function getWidgetPreview(widgetId) {
  return new Promise((resolve, reject) => {
    Widget.findOne({ widgetId }).then(async (widget) => {
      resolve(widget);
    });
  });
}

export async function createWidget(userId, data, displayName) {
  return new Promise(async (resolve, reject) => {
    var widget = new Widget({ userId, widgetId: generateWidgetID(), dateCreated: new Date(), data, displayName: "New Widget" });
    await widget.save();
    resolve(widget);
  });
}

export async function deleteWidget(userId, widgetId) {
  return new Promise((resolve, reject) => {
    Widget.deleteOne({ userId, widgetId })
      .then(() => {
        resolve();
      })
      .catch(() => {
        resolve();
      });
  });
}

export async function editWidgetData(userId, widgetId, data, displayName) {
  return new Promise((resolve, reject) => {
    try {
      Widget.findOne({ userId, widgetId }).then(async (widget) => {
        if (!widget) return resolve();
        widget.displayName = displayName;
        widget.data = data;
        widget.dateModified = new Date();
        await widget.save();
        resolve(true);
      });
    } catch {
      resolve(false);
    }
  });
}

export async function editWidgetInfo(userId, widgetId, displayName, description) {
  return new Promise((resolve, reject) => {
    Widget.findOne({ userId, widgetId }).then(async (widget) => {
      if (!widget) return resolve();
      widget.displayName = displayName;
      widget.description = description;
      widget.dateModified = new Date();
      await widget.save();
      resolve();
    });
  });
}

/*
██╗███╗░░░███╗░█████╗░░██████╗░███████╗░██████╗
██║████╗░████║██╔══██╗██╔════╝░██╔════╝██╔════╝
██║██╔████╔██║███████║██║░░██╗░█████╗░░╚█████╗░
██║██║╚██╔╝██║██╔══██║██║░░╚██╗██╔══╝░░░╚═══██╗
██║██║░╚═╝░██║██║░░██║╚██████╔╝███████╗██████╔╝
╚═╝╚═╝░░░░░╚═╝╚═╝░░╚═╝░╚═════╝░╚══════╝╚═════╝░*/

function generateAssetId() {
  var d = new Date().getTime();
  var uuid = Array(32)
    .fill("x")
    .join("")
    .replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  return uuid;
}

export async function uploadAsset(asset, userId) {
  return new Promise(async (resolve, reject) => {
    console.log(`Asset Upload: Initialized for user ${userId}`);
    var uuid = generateAssetId();
    var { name, size, mimetype } = asset;
    console.log(`Asset Upload: ${name} of size ${size}B`);

    var Assets;
    if (process.env.ENVIRONMENT == "production") {
      var exists = await ProductionAssets.exists({ userId });
      if (!exists) Assets = new ProductionAssets({ userId });
      else Assets = await ProductionAssets.findOne({ userId });
    } else {
      var exists = await DevelopmentAssets.exists({ userId });
      if (!exists) Assets = new DevelopmentAssets({ userId });
      else Assets = await DevelopmentAssets.findOne({ userId });
    }

    Assets.assets.push({
      name,
      size,
      mimetype,
      assetId: uuid,
    });

    var filename = `${uuid}.${mimetype.split("/")[1]}`;
    let uploadPath = "./server/assets/files/" + filename;
    let thumbnailPath = "./server/assets/thumbnails/" + filename;
    asset.mv(uploadPath, function (err) {
      console.log(`Asset Upload Successful ${filename}`);
      Assets.save();
      resolve(uuid);
      sharp(uploadPath).resize(128, 128).toFile(thumbnailPath);
    });
  });
}

export async function getAssets(userId) {
  return new Promise(async (resolve, reject) => {
    var Assets;
    if (process.env.ENVIRONMENT == "production") Assets = await ProductionAssets.findOne({ userId });
    else Assets = await DevelopmentAssets.findOne({ userId });
    if (Assets == null) return resolve([]);
    resolve(Assets.assets);
  });
}

export async function getAsset(assetId) {
  return new Promise(async (resolve, reject) => {
    var assets;
    if (process.env.ENVIRONMENT == "production") assets = await ProductionAssets.findOne({ assets: { $elemMatch: { assetId } } });
    else assets = await DevelopmentAssets.findOne({ assets: { $elemMatch: { assetId } } });

    if (assets == null) return resolve(null);
    var asset = assets.assets.filter((a) => a.assetId == assetId)[0];

    resolve(asset);
  });
}

export async function removeAsset(userId, assetId) {
  return new Promise(async (resolve) => {
    var Assets;
    if (process.env.ENVIRONMENT == "production") Assets = await ProductionAssets.findOne({ userId });
    else Assets = await DevelopmentAssets.findOne({ userId });
    var { mimetype } = Assets.assets.find((asset) => asset.assetId == assetId);
    Assets.assets = Assets.assets.filter((asset) => asset.assetId != assetId);
    await Assets.save();
    resolve();

    var filename = `${assetId}.${mimetype.split("/")[1]}`;
    let uploadPath = "./server/assets/files/" + filename;
    let thumbnailPath = "./server/assets/thumbnails/" + filename;

    fs.unlinkSync(uploadPath);
    fs.unlinkSync(thumbnailPath);
  });
}

export function getProfilePicture(User) {
  var hasProfile = fs.existsSync(`./server/assets/profiles/${User.uuid}.jpg`);

  if (!hasProfile) {
    var assets = [];
    var files = fs.readdirSync("./server/assets/profiles-images", { withFileTypes: true });
    files.forEach((file) => {
      assets.push(file);
    });
    var random = assets[Math.floor(Math.random() * assets.length)];
    if(random) fs.copyFileSync(`./server/assets/profiles-images/${random.name}`, `./server/assets/profiles/${User.uuid}.jpg`);
  }

  return process.env.API_URL + "/assets/profile/" + User.uuid;
}
