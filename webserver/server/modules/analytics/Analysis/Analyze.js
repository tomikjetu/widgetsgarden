import { Access, Analytics } from "../../../database.js";
import { ValidateEvents } from "../Validator.js";
import { AnalyzeAccess } from "./AcessAnalytics.js";
import { AnalyzeUser } from "./UserAnalytics.js";
import { AnalyzeWidget } from "./WidgetAnalytics.js";

export async function Analysis() {
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
  
      var widgets = await getWidgets(userId);
      for (var i = 0; i < widgets.length; i++) {
        var widget = widgets[i];
  
        if (!widget.analytics.overview) widget.analytics.overview = {};
        var pageCollected = widget.analytics.collected;
        var validatedEvents = ValidateEvents(pageCollected);
        if (validatedEvents.length == 0) continue;
  
        console.log(`Analyzing Widget ${widget.displayName} (${widget.widgetId}) (${validatedEvents.length} validated / ${pageCollected.length} collected events)`);
        AnalyzeWidget(validatedEvents, widget.analytics);
  
        widget.markModified(`analytics`);
  
        widget.analytics.collected = [];
        await widget.save();
      }
  
    }
    console.log(`Registered Users (${registeredUsers}), Enabled Analytics (${enabledUsers}). ${activeUsers} active websites in last 1 hour`);
  }
  