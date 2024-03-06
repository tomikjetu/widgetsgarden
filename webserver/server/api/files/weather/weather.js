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

function fetchCurrentWeather(lat, long, unit) {
  var url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}3&longitude=${long}&current=temperature_2m,is_day,rain,weather_code`;
  if (unit) url += `&temperature_unit=${unit}`;
  return new Promise((resolve) => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      });
  });
}

async function weather_temperature(elementId, ...parameters) {
  var lat = parameters[0];
  var long = parameters[1];
  var unit = parameters[2];

  var element = document.getElementById(elementId);
  var value = await fetchCurrentWeather(lat, long, unit);
  if (!value) return;
  element.innerText = `${value["current"]["temperature_2m"]}${value["current_units"]["temperature_2m"]}`;
}
async function weather_icon(elementId, ...parameters) {
  var lat = parameters[0];
  var long = parameters[1];
  var pack = parameters[2];

  var element = document.getElementById(elementId);
  var value = await fetchCurrentWeather(lat, long);
  if (!value) return;

  var { weather_code, is_day } = value["current"];

  var image = getWeatherImage(weather_code, is_day);
  element.src = `/api/files/weather/icons/${pack}/${image}.svg`;
}

async function weather_title(elementId, ...parameters) {
  var lat = parameters[0];
  var long = parameters[1];

  var element = document.getElementById(elementId);
  var value = await fetchCurrentWeather(lat, long);
  if (!value) return;

  var { weather_code } = value["current"];

  var text = getWeatherTitle(weather_code);
  element.innerText = text;
}
