import { DOMAINREGEXP, addIntroPoint, getUser, getUserFromApiKey, getWidget, getWidgets } from "./accounts.js";
import { Widget, Analytics, Access, User } from "./database.js";
import { ORIGINS, accessGranted, canAccess } from "./router/widgets.js";
import cors from "cors";
import geoip from "geoip-lite";

/*
░█████╗░███╗░░██╗░█████╗░██╗░░░░░██╗░░░██╗████████╗██╗░█████╗░░██████╗
██╔══██╗████╗░██║██╔══██╗██║░░░░░╚██╗░██╔╝╚══██╔══╝██║██╔══██╗██╔════╝
███████║██╔██╗██║███████║██║░░░░░░╚████╔╝░░░░██║░░░██║██║░░╚═╝╚█████╗░
██╔══██║██║╚████║██╔══██║██║░░░░░░░╚██╔╝░░░░░██║░░░██║██║░░██╗░╚═══██╗
██║░░██║██║░╚███║██║░░██║███████╗░░░██║░░░░░░██║░░░██║╚█████╔╝██████╔╝
╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚══════╝░░░╚═╝░░░░░░╚═╝░░░╚═╝░╚════╝░╚═════╝░*/

export async function isAnalyticsEnabled(userId) {
  return new Promise(async (resolve) => {
    var analytics = await Analytics.findOne({ userId });
    resolve(analytics?.enabled || false);
  });
}

export async function enableAnalytics(User, enable) {
  return new Promise(async (resolve) => {
    var analytics = await Analytics.findOne({ userId: User.uuid });
    if (!analytics) analytics = new Analytics({ userId: User.uuid });
    analytics.enabled = enable;
    await analytics.save();
    resolve();
    if (enable) addIntroPoint(User, 2);
  });
}

export async function AnalyticRecieved(userId, widgetId, req, statistic, value, origin) {
  var enabled = await isAnalyticsEnabled(userId);
  if (!enabled) return;

  var headers = {
    timestamp: new Date().toLocaleString("en-US", { timeZone: "Europe/Bratislava" }),
    session: req.sessionID,
    ip: req.ip,
    origin,
  };
  if (widgetId) {
    var widget = await Widget.findOne({ userId, widgetId });
    widget.analytics.collected.push({
      name: statistic,
      headers,
      value,
    });
    widget.save();
  } else {
    var analytics = await Analytics.findOne({ userId });
    analytics.collected.push({
      name: statistic,
      headers,
      value,
    });
    analytics.save();
  }
}

if (process.env.ENVIRONMENT == "production") setInterval(Analysis, 60 * 60 * 1000);

function getLocation(ip) {
  if (process.env.ENVIRONMENT == "development") return "SK";
  try {
    if (!ip.match(/(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/)) return null;
    return geoip.lookup(ip).country;
  } catch {
    return null;
  }
}

export async function getAccessAnalytics(userId) {
  return new Promise(async (resolve) => {
    var access = await Access.findOne({ userId });
    resolve(access.usage.overview);
  });
}

var userAnalytics = [
  {
    name: "visit",
    analyzePath: true,
    analyzeCountry: true,
    analyzeValue: false,
  },
];

function AnalyzeUser(pageCollected, UserObject) {
  userAnalytics.forEach((analytic) => {
    var events = pageCollected.filter((event) => event.name == analytic.name);

    events.forEach((event) => {
      var timestamp = new Date(event.headers.timestamp);
      var date = timestamp.getFullYear() + "/" + (timestamp.getMonth() + 1) + "/" + timestamp.getDate();

      var name = event.name;
      if (!UserObject.overview[name]) UserObject.overview[name] = {};
      var ip = event.headers.ip;

      // TODO remove this and the chart from dashboard in a week of testing if the measure is correct
      // path and origin chart is the same

      if (analytic.analyzePath) {
        var path = event.headers.origin.path;
        if (!UserObject.overview[name].path) UserObject.overview[name].path = {};

        if (!UserObject.overview[name].path[domain]) UserObject.overview[name].path[domain] = {};
        if (!UserObject.overview[name].path[domain][path]) UserObject.overview[name].path[domain][path] = {};
        if (!UserObject.overview[name].path[domain][path][date]) UserObject.overview[name].path[domain][path][date] = 0;
        UserObject.overview[name].path[domain][path][date] += 1;
      }

      if (analytic.analyzeCountry) {
        var country = getLocation(ip);
        if (country) {
          if (!UserObject.overview[name].country) UserObject.overview[name].country = {};
          if (!UserObject.overview[name].country[country]) UserObject.overview[name].country[country] = {};
          if (!UserObject.overview[name].country[country][date]) UserObject.overview[name].country[country][date] = 0;
          UserObject.overview[name].country[country][date] += 1;
        }
      }

      if (analytic.analyzeValue) {
        var value = event.value;
        if (!UserObject.overview[name].value) UserObject.overview[name].value = {};
        if (!UserObject.overview[name].value[value]) UserObject.overview[name].value[value] = {};
        if (!UserObject.overview[name].value[value][date]) UserObject.overview[name].value[value][date] = 0;
        UserObject.overview[name].value[value][date] += 1;
      }
    });
  });
}

function AnalyzeAccess(pageLoaded, AccessObject) {
  pageLoaded.forEach((load) => {
    AccessObject.usage.stored.push(load);

    var timestamp = new Date(load.timestamp);
    var date = timestamp.getFullYear() + "/" + (timestamp.getMonth() + 1) + "/" + timestamp.getDate();

    if (load.authorized) {
      if (!AccessObject.usage.overview.authorized) AccessObject.usage.overview.authorized = {};
      if (!AccessObject.usage.overview.authorized[date]) AccessObject.usage.overview.authorized[date] = 0;
      AccessObject.usage.overview.authorized[date] += 1;
    } else {
      if (!AccessObject.usage.overview.restricted) AccessObject.usage.overview.restricted = {};
      if (!AccessObject.usage.overview.restricted[date]) AccessObject.usage.overview.restricted[date] = 0;
      AccessObject.usage.overview.restricted[date] += 1;
    }
  });
}

function ValidateEvents(events) {
  // var sessions = {};
  var validatedEvents = [];
  // Validate
  for (var collectedEvent of events) {
    var session = collectedEvent.headers.session;
    var name = collectedEvent.name;
    var value = collectedEvent.value;
    var time = new Date(collectedEvent.headers.timestamp);

    var repetetionPrevention = validatedEvents.filter((event) => event.headers.session == session && event.name == name && JSON.stringify(event.value) == JSON.stringify(value));

    let maxTime = new Date(0); // Previous event
    for (var event of repetetionPrevention) {
      var t = new Date(event.headers.timestamp);
      if (maxTime.getTime() < t.getTime()) maxTime = t;
    }

    var diff = time.getTime() - maxTime.getTime();
    var repeated = diff < 1000 * 60 * 10; // 10 Minutes
    if (!repeated) validatedEvents.push(collectedEvent);
  }
  return validatedEvents;
}

async function Analysis() {
  console.log("Starting Analysis");
  var docs = await User.find({}).lean().exec();
  console.log(`Found ${docs.length} users`);
  var registeredUsers = 0;
  var activeUsers = 0;
  var enabledUsers = 0;
  for (var i = 0; i < docs.length; i++) {
    var userId = docs[i].uuid;

    var AnalyticsObject = await Analytics.findOne({ userId });
    var AccessObject = await Access.findOne({ userId });

    var enabled = AnalyticsObject?.enabled || false;
    console.log(`User: ${userId} (Analytics ${enabled ? "Enabled" : "Disabled"})`);
    registeredUsers++;

    if (AccessObject.usage.loaded.length > 0) {
      activeUsers++;
      if (!AccessObject.usage.overview) AccessObject.usage.overview = {};
      if (!AccessObject.usage.stored) AccessObject.usage.stored = [];

      AnalyzeAccess(AccessObject.usage.loaded, AccessObject);

      console.log(`ApiKey usage: ${AccessObject.usage.loaded.length}`);

      AccessObject.usage.loaded = [];
      AccessObject.markModified(`usage`);
      await AccessObject.save();
    }

    if (!enabled) continue;
    enabledUsers++;

    if (!AnalyticsObject.overview) AnalyticsObject.overview = {}; // First time making alaytics

    var pageCollected = AnalyticsObject.collected;

    var validatedEvents = ValidateEvents(pageCollected);

    console.log(`Validated ${validatedEvents.length}/${pageCollected.length} user events`);
    if (validatedEvents.length == 0) continue;

    AnalyzeUser(validatedEvents, AnalyticsObject);

    AnalyticsObject.markModified(`overview`);

    AnalyticsObject.collected = [];
    AnalyticsObject.lastAnalysis = Date.now();
    await AnalyticsObject.save();


    // var widgets = await getWidgets(userId);
    // for (var i = 0; i < widgets.length; i++) {
    //   var widget = widgets[i];

    //   if(!widget.analytics.overview) widget.analytics.overview = {};
    //   var pageCollected = widget.analytics.collected;
    //   var validatedEvents = ValidateEvents(pageCollected);
    //   if (validatedEvents.length == 0) continue;

    //   AnalyzeWidget(validatedEvents, widget.analytics);
    // }

  }
  console.log(`Registered Users (${registeredUsers}), Enabled Analytics (${enabledUsers}). ${activeUsers} active websites in last 1 hour`);
}

export async function getDashboardAnalytics(userId, timespan) {
  var AnalyticsObject = await Analytics.findOne({ userId });
  var AccessObject = await Access.findOne({ userId });

  var enabled = AnalyticsObject?.enabled || false;

  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - timespan);
  
  function getSum(source) {
    var timeSelectedData = {};
    Object.keys(source).forEach((entry) => {
      timeSelectedData[entry] = Object.fromEntries(
        Object.entries(source[entry]).filter(([key]) => {
          var current = new Date(key).getTime();
          return current >= startDate && current <= endDate;
        })
      );
    });
    
    var tempTotalValue = 0;
    Object.keys(timeSelectedData).forEach(function (key, index) {
      tempTotalValue += Object.values(timeSelectedData[key] ?? []).reduce((a, b) => a + b, 0);
    });

    return tempTotalValue;
  }

  return {
    enabled: enabled,
    overview: {
      analytics:  getSum(AnalyticsObject.overview['visit'].country),
      access: getSum(AccessObject.usage.overview),
    },
  };
}

export default function analytics(app) {
  app.post(
    "/analytics",
    cors({
      origin: function (origin, callback) {
        callback(null, true);
      },
    }),
    async (req, res) => {
      var iframe = canAccess(req);
      var page = await accessGranted(req);

      if (!iframe && !page) return res.sendStatus(403);

      var origin;

      if (iframe) origin = ORIGINS[req.body.secret];
      else
        origin = {
          referrer: req.query.referrer,
          path: req.query.path,
        };

      const User = await getUserFromApiKey(req.body.apiKey);
      if (!User) return res.sendStatus(200);
      AnalyticRecieved(User.uuid, req.body.widgetId, req, req.body.analytic, req.body.value, origin);
      res.sendStatus(200);
    }
  );
}
