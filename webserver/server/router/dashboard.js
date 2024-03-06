// ██████╗░░█████╗░░██████╗██╗░░██╗██████╗░░█████╗░░█████╗░██████╗░██████╗░
// ██╔══██╗██╔══██╗██╔════╝██║░░██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗
// ██║░░██║███████║╚█████╗░███████║██████╦╝██║░░██║███████║██████╔╝██║░░██║
// ██║░░██║██╔══██║░╚═══██╗██╔══██║██╔══██╗██║░░██║██╔══██║██╔══██╗██║░░██║
// ██████╔╝██║░░██║██████╔╝██║░░██║██████╦╝╚█████╔╝██║░░██║██║░░██║██████╔╝
// ╚═════╝░╚═╝░░╚═╝╚═════╝░╚═╝░░╚═╝╚═════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═════╝░

import fs from "fs";

import { isLogged, isAdmin, getUserSerialization, getAccess, getDomains, getApiKey, removeRestrictedDomain, addAllowedDomain, removeAllowedDomain, getMessages, readMessage, sendMessage, getWidgets, createWidget, deleteWidget, editWidgetData, editWidgetInfo, getWidget, deleteMessage, getUser } from "../accounts.js";
import { User, Access, Message, Analytics } from "../database.js";
import { enableAnalytics, getAccessAnalytics, isAnalyticsEnabled } from "../analytics.js";
import { CopyWidget, GetLibrary, LibraryAddWidget, LibraryHasWidget, LibraryRemoveWidget } from "../library.js";

export default function (app) {
  /* access */

  app.get("/api/dashboard/apikey", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    const apiKey = await getApiKey(User.uuid);
    res.send(apiKey);
  });

  app.get("/api/dashboard/domains", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var list = await getDomains(User.uuid);
    res.send(list);
  });

  app.get("/api/dashboard/access/stats", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var stats = await getAccessAnalytics(User.uuid);
    res.send(stats);
  });

  app.put("/api/dashboard/domains/allowed", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    await addAllowedDomain(User.uuid, req.body.domain);
    res.sendStatus(200);
  });

  app.delete("/api/dashboard/domains/allowed", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    await removeAllowedDomain(User.uuid, req.body.domain);
    res.sendStatus(200);
  });

  app.delete("/api/dashboard/domains/restricted", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    await removeRestrictedDomain(User.uuid, req.body.domain);
    res.sendStatus(200);
  });

  /* WIDGETS API */

  app.get("/api/dashboard/widget", isLogged, async (req, res) => {
    var id = req.query.id;
    const User = getUserSerialization(req);
    var widget = await getWidget(id, User.uuid);
    if(widget) widget.analytics = {};
    if (!req.query.data) widget.data = {};
    res.json(widget);
  });

  app.get("/api/dashboard/widgets", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var widgets = await getWidgets(User.uuid);
    widgets.forEach((element) => {
      element.analytics = {}; // TODO load stats
      element.data = {};
    });

    res.json(widgets);
  });

  app.put("/api/dashboard/widget", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var data = [{ type: "Widget", width: 100, height: 100, x: 0, y: 0, backgroundColor: "white", zIndex: 0 }];
    var displayName = req.body.displayName;
    var widget = await createWidget(User.uuid, data, displayName);
    res.json({ id: widget.widgetId });
  });

  app.put("/api/dashboard/editwidgetdata", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var widgetId = req.body.widgetId;
    var data = req.body.data;
    var displayName = req.body.displayName;
    var message = await editWidgetData(User.uuid, widgetId, data, displayName);
    res.json({ message });
  });

  app.put("/api/dashboard/editwidgetinfo", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var widgetId = req.body.widgetId;
    var displayName = req.body.displayName;
    var description = req.body.description;
    await editWidgetInfo(User.uuid, widgetId, displayName, description);
    res.json(200);
  });

  app.delete("/api/dashboard/widget", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var widgetId = req.body.widgetId;
    await deleteWidget(User.uuid, widgetId);
    res.json(200);
  });

  app.get("/api/dashboard/library/widgets", isLogged, async (req, res) => {
    var lib = await GetLibrary();
    res.json(lib);
  });

  app.get("/api/dashboard/library/copy", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var widgetId = req.query.id;
    var response = await CopyWidget(widgetId, User.uuid);
    res.json({ success: response });
  });

  app.get("/api/dashboard/library/widget", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var widgetId = req.query.id;
    var widget = await getWidget(widgetId, User.uuid);
    if (!widget) return res.json(null);
    res.json({ published: await LibraryHasWidget(widgetId) });
  });

  app.put("/api/dashboard/library/widget", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var widgetId = req.query.id;
    var widget = await getWidget(widgetId, User.uuid);
    if (!widget) return res.json(null);

    var exists = await LibraryHasWidget(widgetId);
    if (exists) await LibraryRemoveWidget(widgetId);
    else await LibraryAddWidget(widget);
    res.json(200);
  });

  app.get("/api/dashboard/overview", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    const widgetsCount = JSON.parse(JSON.stringify(await getWidgets(User.uuid))).length;

    var data = {
      user: {
        widgets: widgetsCount,
      },
    };

    res.json(data);
  });

  // Analytics

  app.get("/api/dashboard/analytics", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    const enabled = await isAnalyticsEnabled(User.uuid);

    if (!enabled) return res.json({ enabled: false });

    var UserObject = await Analytics.findOne({ userId: User.uuid });

    res.json({
      enabled: true,
      overview: {
        user: UserObject.overview,
      },
    });
  });

  app.post("/api/dashboard/enableAnalytics", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    var enable = req.body.enable;
    await enableAnalytics(User.uuid, enable);
    res.sendStatus(200);
  });

  // Messages

  app.get("/api/dashboard/messages", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    res.json(await getMessages(User.uuid));
  });

  app.put("/api/dashboard/message/read/:id", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    await readMessage(User.uuid, req.params.id);
    res.sendStatus(200);
  });

  app.delete("/api/dashboard/message/:id", isLogged, async (req, res) => {
    const User = getUserSerialization(req);
    await deleteMessage(User.uuid, req.params.id);
    res.sendStatus(200);
  });

  app.get("/api/admin/html", isAdmin, async (req, res) => {
    var html = fs.readFileSync("./server/misc/admin.html", "utf-8");
    res.send(html);
  });

  app.get("/api/admin/data", isAdmin, async (req, res) => {
    var docs = await User.find({}).lean().exec();
    var i = 0;
    for (var user of docs) {
      docs[i++].access = await Access.findOne({ userId: user.uuid });
    }
    res.json(docs);
  });

  app.post("/api/admin/message", isAdmin, async (req, res) => {
    var title = req.body.messagetitle;
    var text = req.body.messagetext;
    var userId = req.body.userId;
    var link = req.body.link;
    var important = req.body.important;
    var email = req.body.emaill; // send to email?
    sendMessage(userId, new Message(title, text, link, important));
  });
}
