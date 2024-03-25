var userAnalytics = [
  {
    name: "visit",
    analyzePath: true,
    analyzeCountry: true,
    analyzeValue: false,
  },
];

export function AnalyzeUser(pageCollected, UserObject) {
  userAnalytics.forEach((analytic) => {
    var events = pageCollected.filter((event) => event.name == analytic.name);

    events.forEach((event) => {
      var timestamp = new Date(event.headers.timestamp);
      var date = timestamp.getFullYear() + "/" + (timestamp.getMonth() + 1) + "/" + timestamp.getDate();

      var name = event.name;
      if (!UserObject.overview[name]) UserObject.overview[name] = {};
      var ip = event.headers.ip;

      if (analytic.analyzePath) {
        var origin = event.headers.origin.referrer;
        var domain = origin.match(DOMAINREGEXP)[0];
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
