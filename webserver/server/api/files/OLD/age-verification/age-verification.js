function VerifyAge(verified) {
  const { redirect } = data;
  sendMessage({
    event: "widgetEvent",
    data: {
      verified: verified,
      redirect: redirect.value,
    },
  });
}

function generateDates() {
  var select = document.getElementById("date");
  select.innerHTML = "";
  var selectedMonth = document.getElementById("month").value || 0;
  var days = document.getElementById("month").querySelector(`[value="${selectedMonth}"]`).getAttribute("days");
  for (var i = 1; i <= days; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.innerText = i;
    select.append(option);
  }
}

function generateYears() {
  var select = document.getElementById("year");
  select.innerHTML = "";
  var currentYear = new Date().getFullYear();
  for (var i = 0; i <= 100; i++) {
    let option = document.createElement("option");
    var year = currentYear - i;
    option.value = year;
    option.innerText = year;
    select.append(option);
  }
}

function enter() {
  const { min, askForAge } = data;
  if (askForAge.value) {
    var birthday = new Date();
    birthday.setMonth(document.getElementById("month").value);
    birthday.setDate(document.getElementById("date").value);
    birthday.setFullYear(document.getElementById("year").value);

    var diff = Date.now() - birthday;
    var ageDate = new Date(diff);
    var age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age >= min.value) {
      AnalyticUse("verified");
      VerifyAge(true);
    } else {
      AnalyticUse("not-old-enough");
      document.getElementById("fail-message").style.display = "block";
    } 
  } else {
    AnalyticUse("enter");
    VerifyAge(true);
  }
}

function exit() {
  AnalyticUse("exit");
  VerifyAge(false);
}

function replacePlaceholders(text) {
  const { min } = data;
  text = text.replace(/{AGE}/g, min.value);
  return text;
}

window.addEventListener("widgetLoad", () => {
  const { heading, caption, askForAge, failMessage } = data;

  document.getElementById("heading").innerText = replacePlaceholders(heading.value);
  document.getElementById("caption").innerText = replacePlaceholders(caption.value);
  document.getElementById("fail-message").innerText = replacePlaceholders(failMessage.value);

  document.getElementById("birthday").style.display = askForAge.value ? "flex" : "none";
  generateDates();
  generateYears();

  document.getElementById("enter-button").onclick = enter;
  document.getElementById("exit-button").onclick = exit;
});

window.addEventListener("scriptLoaded", (event) => {
  var { script } = event.detail;
  INITIALIZED = isScriptLoaded("widgetsgarden-cookies");
});
