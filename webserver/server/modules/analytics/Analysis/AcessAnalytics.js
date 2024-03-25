export function AnalyzeAccess(pageLoaded, AccessObject) {
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