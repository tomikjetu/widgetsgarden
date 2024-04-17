// API CALL FOR CURRENT WEATHER
// https://api.open-meteo.com/v1/forecast?latitude=48.6225653&longitude=22.2769719&current=temperature_2m,is_day,rain,weather_code

// GET MORE ENDPOINTS
// https://open-meteo.com/en/docs#current=temperature_2m,is_day,rain,weather_code&hourly=&forecast_days=1

function getWeatherImage(code, is_day) {
  var time = is_day ? "day" : "night";
  switch (code) {
    case 0:
      return `clear-${time}`;
    case 1:
    case 2:
      return `cloudy-${time}`;
    case 3:
      return "heavy-cloudy";
    case 45:
    case 48:
      return "fog";
    case 51:
    case 56:
    case 66:
    case 61:
    case 80:
      //light rain
      return "rain";
    case 53:
    case 63:
    case 81:
      // moderate rain
      return "rain";
    case 55:
    case 57:
    case 67:
    case 65:
    case 82:
      //heavy rain
      return "rain";
    case 95:
    case 96:
    case 99:
      return "thunderstorm";
    case 71:
    case 77:
    case 85:
      return "light-snow";
    case 73:
      // moderate
      return "snow";
    case 75:
    case 86:
      //heavy
      return "snow";
  }
}

function getWeatherTitle(code) {
  return (
    {
      0: "Clear sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Freezing drizzle",
      57: "Dense freezing Drizzle",
      66: "Freezing rain",
      67: "Heavy freezing rain",
      61: "Light rain",
      63: "Moderate rain",
      65: "Heavy rain",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm",
      99: "Thunderstorm",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      77: "Snow grains",
      85: "Snow showers",
      86: "Heavy snow showers",
    }[code] ?? "N/A"
  );
}

var weatherCache = {};
function getUrl(long, lat) {
  var url = "https://api.open-meteo.com/v1/forecast";
  url += `?latitude=${lat}3&longitude=${long}`;
  url += "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max";
  url += "&current=temperature_2m,is_day,rain,weather_code";
  url += "&temperature_unit=celsius";
  return url;
}

function getTemperature(value, unit) {
  var c_value = value;
  if (unit == "farhenheit") c_value = c_value * 1.8 + 32;
  var c_unit = unit === "celsius" ? "°C" : "°F";
  return { c_value, c_unit };
}

function fetchWeather(lat, long) {
  var key = `${lat}-${long}`;
  var url = getUrl(long, lat);

  if (weatherCache[key]) {
    if (weatherCache[key].isFinished) return weatherCache[key].value;
    else
      return new Promise(async (resolve) => {
        weatherCache[key].onFinish(() => {
          resolve(weatherCache[key].value);
        });
      });
  }

  weatherCache[key] = {
    isFinished: false,
    listeners: [],
    onFinish: (cb) => {
      weatherCache[key].listeners.push(cb);
    },
    finish: (value) => {
      weatherCache[key].value = value;
      weatherCache[key].listeners.forEach((cb) => cb());
    },
  };

  return new Promise((resolve) => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        weatherCache[key].finish(res);
        resolve(res);
      });
  });
}

async function weather_temperature(elementId, ...parameters) {
  var lat = parameters[0];
  var long = parameters[1];
  var unit = parameters[2];

  var element = document.getElementById(elementId);
  var value = await fetchWeather(lat, long);
  if (!value) return;

  var { c_value, c_unit } = getTemperature(value["current"]["temperature_2m"], unit);

  element.innerText = `${c_value}${c_unit}`;
}
async function weather_icon(elementId, ...parameters) {
  var lat = parameters[0];
  var long = parameters[1];
  var pack = parameters[2];

  var element = document.getElementById(elementId);
  var value = await fetchWeather(lat, long);
  if (!value) return;

  var { weather_code, is_day } = value["current"];

  var image = getWeatherImage(weather_code, is_day);
  element.src = `/api/files/weather/icons/${pack}/${image}.svg`;
}

async function weather_title(elementId, ...parameters) {
  var lat = parameters[0];
  var long = parameters[1];

  weather_forecast(elementId, lat, long, "celsius", 5);

  var element = document.getElementById(elementId);
  var value = await fetchWeather(lat, long);
  if (!value) return;

  var { weather_code } = value["current"];

  var text = getWeatherTitle(weather_code);
  element.innerText = text;
}
var ddd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
async function weather_forecast(elementId, ...parameters) {
  var lat = parameters[0];
  var long = parameters[1];
  var unit = parameters[2];
  var days = parseInt(parameters[3]);
  var icon_pack = parameters[4];
  var orientation = parameters[5]; 
  var timezone = parseInt(parameters[6]);


  var element = document.getElementById(elementId);
  var value = await fetchWeather(lat, long);
  if (!value) return;

  element.classList.add("weather-forecast");
  element.style.overflow = "";
  element.classList.add(orientation  == "horizontal" ? "horizontal" : "vertical")

  for (var i = 0; i < days; i++) {
    var date = new Date(value["daily"]["time"][i]);
    var weather_code = value["daily"]["weather_code"][i];
    var sunrise = new Date(value["daily"]["sunrise"][i]);
    var sunset = new Date(value["daily"]["sunset"][i]);
    
    sunrise.setHours(sunrise.getHours() + timezone);
    sunset.setHours(sunset.getHours() + timezone);

    var { c_value: min_value, c_unit } = getTemperature(value["daily"]["temperature_2m_min"][i], unit);
    var { c_value: max_value } = getTemperature(value["daily"]["temperature_2m_max"][i], unit);
    var rain = value["daily"]["precipitation_probability_max"][i];

    var container = document.createElement("div");
    container.classList.add("weather-forecast-day");

    var dateElement = document.createElement("p");
    dateElement.classList.add("date");
    dateElement.innerText = ddd[date.getDay()];
    container.appendChild(dateElement);

    var iconElement = document.createElement("img");
    iconElement.classList.add("icon");
    var image = getWeatherImage(weather_code, true);
    iconElement.src = `/api/files/weather/icons/${icon_pack}/${image}.svg`;
    container.appendChild(iconElement);

    var temperatures = document.createElement("div");
    temperatures.classList.add("temperatures");

    var maxElement = document.createElement("p");
    maxElement.classList.add("maxTemperature");
    maxElement.innerText = `${max_value}${c_unit}`;
    temperatures.appendChild(maxElement);

    var minElement = document.createElement("p");
    minElement.classList.add("minTemperature");
    minElement.innerText = `${min_value}${c_unit}`;
    temperatures.appendChild(minElement);

    container.append(temperatures);

    var details = document.createElement("div");
    details.classList.add('details');

    var rainElement = document.createElement("p");
    rainElement.classList.add("rain");
    rainElement.innerText = `${rain}%`;
    details.appendChild(rainElement);

    var sunriseElement = document.createElement("p");
    sunriseElement.classList.add("sunrise");
    sunriseElement.innerText = (sunrise.getHours() >= 10 ? sunrise.getHours() : "0" + sunrise.getHours()) + ":" + (sunrise.getMinutes() >= 10 ? sunrise.getMinutes() : "0" + sunrise.getMinutes());
    details.appendChild(sunriseElement);

    var sunsetElement = document.createElement("p");
    sunsetElement.classList.add("sunset");
    sunsetElement.innerText = (sunset.getHours() >= 10 ? sunset.getHours() : "0" + sunset.getHours()) + ":" + (sunset.getMinutes() >= 10 ? sunset.getMinutes() : "0" + sunset.getMinutes());
    details.appendChild(sunsetElement);

    console.log(sunset.getTimezoneOffset());

    container.appendChild(details);

    element.appendChild(container);
  }
}
