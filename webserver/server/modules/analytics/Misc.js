import geoip from "geoip-lite";
import { Access, Analytics, Widget } from "../../database.js";

export function getLocation(ip) {
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

// Analytics displayed at the main page

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
      analytics: getSum(AnalyticsObject.overview["visit"].country),
      access: getSum(AccessObject.usage.overview),
    },
  };
}

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
