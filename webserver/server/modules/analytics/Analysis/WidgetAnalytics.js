var widgetAnalytics = [
  {
    name: "loadWidget",
    analyzeTimestamp: true,
    analyzePath: true,
    analyzeValue: false,
  },
  {
    name: "scrollInView",
    analyzeTimestamp: true,
    analyzePath: false,
    analyzeValue: false,
  },
  {
    name: "hover",
    analyzeTimestamp: true,
    analyzePath: false,
    analyzeValue: false,
  },
  {
    name: "click",
    analyzeTimestamp: true,
    analyzePath: false,
    analyzeValue: true,
    valueGetter: (data) => {
      return `${data.x}:${data.y}`;
    },
  },
  // More specific events
  {
    name: "use",
    values: ["close", "scroll", "view-video", "share-[X]"],
    analyzeTimestamp: false,
    analyzePath: false,
    analyzeValue: true,
  },
  {
    name: "submit",
    // here should be a value submitted
    analyzeTimestamp: true,
    analyzePath: false,
    analyzeValue: false,
  },
];

export function AnalyzeWidget(pageCollected, WidgetObject) {
  widgetAnalytics.forEach((analytic) => {
    var events = pageCollected.filter((event) => event.name == analytic.name);
    events.forEach((event) => {
      var timestamp = new Date(event.headers.timestamp);
      var date = timestamp.getFullYear() + "/" + (timestamp.getMonth() + 1) + "/" + timestamp.getDate();

      var name = event.name;
      if (!WidgetObject.overview[name]) WidgetObject.overview[name] = {};

      if (analytic.analyzeTimestamp) {
        if (!WidgetObject.overview[name].timestamp) WidgetObject.overview[name].timestamp = {};
        if (!WidgetObject.overview[name].timestamp[date]) WidgetObject.overview[name].timestamp[date] = 0;
        WidgetObject.overview[name].timestamp[date] += 1;
      }

      if (analytic.analyzePath) {
        var origin = event.headers.origin.referrer;
        var domain = origin.match(DOMAINREGEXP)[0];
        var path = event.headers.origin.path;
        if (!WidgetObject.overview[name].path) WidgetObject.overview[name].path = {};

        if (!WidgetObject.overview[name].path[domain]) WidgetObject.overview[name].path[domain] = {};
        if (!WidgetObject.overview[name].path[domain][path]) WidgetObject.overview[name].path[domain][path] = {};
        if (!WidgetObject.overview[name].path[domain][path][date]) WidgetObject.overview[name].path[domain][path][date] = 0;
        WidgetObject.overview[name].path[domain][path][date] += 1;
      }

      if (analytic.analyzeValue) {
        var value = event.value;
        if (analytic.valueGetter) value = analytic.valueGetter(event.value);
        if (!WidgetObject.overview[name].value) WidgetObject.overview[name].value = {};
        if (!WidgetObject.overview[name].value[value]) WidgetObject.overview[name].value[value] = {};
        if (!WidgetObject.overview[name].value[value][date]) WidgetObject.overview[name].value[value][date] = 0;
        WidgetObject.overview[name].value[value][date] += 1;
      }
    });
  });
}
