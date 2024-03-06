function updateTimeDigital(element, date, format, animations) {
  var format = formatDate(date, format);
  // TODO MULTILINE
  var wrapper = document.createElement("div");
  for (var char of format.split("")) {
    var character = document.createElement("p");
    character.innerText = char == " " ? " " : char;
    wrapper.append(character);
  }

  if (element.childNodes.length != wrapper.childNodes.length) return (element.innerHTML = wrapper.innerHTML);

  element.childNodes.forEach((child, i) => {
    var value = wrapper.childNodes[i].innerText;
    if (child.innerText == value || (element.style["text-transform"] && child.innerText.toUpperCase() == value.toUpperCase())) return;
    child.innerText = value == " " ? " " : value;
    if (!animations) return;
    child.classList.add("time-animation-in");
    setTimeout(function () {
      child.classList.remove("time-animation-in");
    }, 800);
  });
}

function formatDate(date, format, utc) {
  var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function ii(i, len) {
    var s = i + "";
    len = len || 2;
    while (s.length < len) s = "0" + s;
    return s;
  }

  var storedTexts = [];
  var texts = format.match(/'([^']){0,}'/g);
  texts?.forEach((text) => {
    format = format.replace(text, `{${storedTexts.length}}`);
    storedTexts.push(text.replace(/'/g, ""));
  });

  format = format.replace(/cY/g, Math.floor(date / 1000 / 60 / 60 / 24 / 30.5 / 12));

  // Countdown Month
  format = format.replace(/cMM/g, Math.floor((date / 1000 / 60 / 60 / 24 / 30.5) % 12));
  format = format.replace(/cM/g, Math.floor(date / 1000 / 60 / 60 / 24 / 30.5));

  // Countdown days difference
  format = format.replace(/cDD/g, Math.floor((date / 1000 / 60 / 60 / 24) % 30.5));
  // Countdown days
  format = format.replace(/cD/g, Math.floor(date / 1000 / 60 / 60 / 24));

  // Countdown hours
  format = format.replace(/chh/g, Math.floor((date / 1000 / 60 / 60) % 24));
  format = format.replace(/ch/g, Math.floor(date / 1000 / 60 / 60));

  // Countdown minutes
  format = format.replace(/cmm/g, Math.floor(date / 1000 / 60 / 60));
  format = format.replace(/cm/g, Math.floor((date / 1000 / 60) % 60));

  // Countdown seconds
  format = format.replace(/css/g, Math.floor(date / 1000 / 60));
  format = format.replace(/cs/g, Math.floor((date / 1000) % 60));

  var y = utc ? date.getUTCFullYear() : date.getFullYear();
  format = format.replace(/(^|[^\\])YYYY+/g, "$1" + y);
  format = format.replace(/(^|[^\\])YY/g, "$1" + y.toString().substr(2, 2));
  format = format.replace(/(^|[^\\])Y/g, "$1" + y);

  var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
  format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
  format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
  format = format.replace(/(^|[^\\])M/g, "$1" + M);

  var d = utc ? date.getUTCDate() : date.getDate();
  format = format.replace(/(^|[^\\])DDDD+/g, "$1" + dddd[0]);
  format = format.replace(/(^|[^\\])DDD/g, "$1" + ddd[0]);
  format = format.replace(/(^|[^\\])DD/g, "$1" + ii(d));
  format = format.replace(/(^|[^\\])DD/g, "$1" + d);

  var H = utc ? date.getUTCHours() : date.getHours();
  format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
  format = format.replace(/(^|[^\\])H/g, "$1" + H);

  var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
  format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
  format = format.replace(/(^|[^\\])h/g, "$1" + h);

  var m = utc ? date.getUTCMinutes() : date.getMinutes();
  format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
  format = format.replace(/(^|[^\\])m/g, "$1" + m);

  var s = utc ? date.getUTCSeconds() : date.getSeconds();
  format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
  format = format.replace(/(^|[^\\])s/g, "$1" + s);

  // var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
  // format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
  // f = Math.round(f / 10);
  // format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
  // f = Math.round(f / 10);
  // format = format.replace(/(^|[^\\])f/g, "$1" + f);

  var T = H < 12 ? "AM" : "PM";
  format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
  format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

  var t = T.toLowerCase();
  format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
  format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

  var tz = -date.getTimezoneOffset();
  var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
  if (!utc) {
    tz = Math.abs(tz);
    var tzHrs = Math.floor(tz / 60);
    var tzMin = tz % 60;
    K += ii(tzHrs) + ":" + ii(tzMin);
  }
  format = format.replace(/(^|[^\\])K/g, "$1" + K);

  var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
  format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
  format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

  format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
  format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

  format = format.replace(/\\(.)/g, "$1");

  var holders = format.match(/{[0-9]+}/g);
  holders?.forEach((holder, i) => {
    format = format.replace(holder, storedTexts[i]);
  });

  return format;
}
