export function ValidateEvents(events) {
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
