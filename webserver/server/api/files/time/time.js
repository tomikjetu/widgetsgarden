function time_digital(elementId, ...parameters) {
  var element = document.getElementById(elementId);
  var TIMEZONE = parseInt(parameters[0]);
  var TIMEZONE_OFFSET = (new Date().getTimezoneOffset() + TIMEZONE * 60) * 60 * 1000;
  var format = parameters[1];
  var animations = parameters[2];

  element.classList.add("time-display");

  updateTimeDigital(element, getTime(TIMEZONE_OFFSET), format, animations);
  setInterval(() => {
    updateTimeDigital(element, getTime(TIMEZONE_OFFSET), format, animations);
  }, 1000);
}

function time_digital_countdown(elementId, ...parameters) {
  var element = document.getElementById(elementId);

  var TIMEZONE = parseInt(parameters[0]);
  var TIMEZONE_OFFSET = (new Date().getTimezoneOffset() + TIMEZONE * 60) * 60 * 1000;
  var COUNTDOWN_DATE = parseInt(parameters[1]);
  var COUNTDOWN_TIME = parseInt(parameters[2]);
  var doneMessage = parameters[3];
  var format = parameters[4];
  var animations = parameters[5];

  element.classList.add("time-display");

  function updateCountDown() {
    var time = getTimeCountdown(TIMEZONE_OFFSET, COUNTDOWN_DATE, COUNTDOWN_TIME);
    if (time < 0) element.innerText = doneMessage;
    else updateTimeDigital(element, time, format, animations);
  }

  setInterval(updateCountDown, 1000);
}

function time_analog(elementId, ...parameters) {
  var element = document.getElementById(elementId);

  var TIMEZONE = parseInt(parameters[0]);
  var TIMEZONE_OFFSET = (new Date().getTimezoneOffset() + TIMEZONE * 60) * 60 * 1000;
  var style = parameters[1];
  loadScriptWidget(`/api/files/time/styles/${style}.css?apiKey=${apiKey}`).then(() => {
    var settingsData = getComputedStyle(element)
      .getPropertyValue(`--${style}-analog-settings`)
      .substring(1, getComputedStyle(element).getPropertyValue(`--${style}-analog-settings`).length - 1);

    var settings = settingsData?.split(";") || [];

    var additional = "";

    if (settings.includes("indicators")) for (var i = 0; i < 60; i++) additional += `<div class='${style}-indicator'></div>`;
    if (settings.includes("numbers")) {
      additional += "<div>";
      for (var i = 0; i < 12; i++) additional += `<div class='${style}-number'>${i+1}</div>`;
      additional += "</div>";
    }
    element.innerHTML = `<div class="${style}-clock">
     <span class="hour ${style}-hour"></span>
     <span class="minute ${style}-minute"></span>
     <span class="second ${style}-second"></span>
     <span class="${style}-dot"></span>
     ${additional}
    </div>`;

    element.style.width = element.style.width;
    element.style.height = element.style.height;
    element.style.position = element.style.position;
    element.style.left = element.style.left;
    element.style.top = element.style.top;

    updateTimeAnalog(element, getTime(TIMEZONE_OFFSET));
    setInterval(() => {
      updateTimeAnalog(element, getTime(TIMEZONE_OFFSET));
    }, 1000);
  });
}

function getTime(TIMEZONE_OFFSET) {
  var d = new Date();

  d.setTime(d.getTime() + TIMEZONE_OFFSET);

  return d;
}

function getTimeCountdown(TIMEZONE_OFFSET, COUNTDOWN_DATE, COUNTDOWN_TIME) {
  var d = new Date();
  var countdowndate = new Date(COUNTDOWN_DATE + 1);
  var countdowntime = new Date(COUNTDOWN_TIME - 60 * 1000);
  countdowntime.setDate(countdowndate.getDate());
  countdowntime.setMonth(countdowndate.getMonth());
  countdowntime.setFullYear(countdowndate.getFullYear());

  d.setTime(d.getTime() + TIMEZONE_OFFSET);

  d = new Date(countdowntime - d);
  return d;
}
