import "./styles/index.css";

const cityNameCon = document.querySelector("#h1-city-name");
const actualTempCon = document.querySelector("#actual-temp");
const feelsTempCon = document.querySelector("#feels-temp");
const weatherIcon = document.querySelector("#weather-icon");
const windP = document.querySelector("#weather-wind");
const dateP = document.querySelector("#weather-date");
const dayTimeP = document.querySelector("#weather-day-time");
const remark = document.querySelector("#weather-remark");
const ffWeatherCon = document.querySelector("#ff-weather-con");
const rainEl = document.querySelector("#weather-rain");
const weatherBtn = document.querySelector("#city-btn");
const weatherInput = document.querySelector("#city-input");

function getIcon(icon) {
  return `http://openweathermap.org/img/wn/${icon}@2x.png`;
}

async function getWeather(cityName) {
  if (cityName.trim() === "") throw new Error("Empty input field!");
  const geoRaw = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=d87e12463a9bfee6703b4bba1ec5d0ca`
  );
  const geoJson = await geoRaw.json();

  const geo = geoJson[0];
  if (geo === undefined) throw new Error("Undefined field!");
  const weatherRaw = await fetch(
    // `http://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=d87e12463a9bfee6703b4bba1ec5d0ca`
    // `http://api.openweathermap.org/data/2.5/weather?lat=${geo.lat}&lon=${geo.lon}&appid=d87e12463a9bfee6703b4bba1ec5d0ca`
    `https://api.openweathermap.org/data/2.5/onecall?lat=${geo.lat}&lon=${geo.lon}&exclude=minutely&appid=d87e12463a9bfee6703b4bba1ec5d0ca`
  );
  const weatherJson = await weatherRaw.json();
  return [cityName, weatherJson];
}

function toCelsius(num, unit = "k") {
  const temp = unit === "k" ? num - 273.15 : ((num - 273.15) * 9) / 35 + 32;
  return `${parseInt(temp, 10)}°C`;
}
function getDateTime(dateArg = Date()) {
  const arr = dateArg.split(" ");
  const split = arr[4].split(":");
  const hour = Number(split[0]) > 12 ? split[0] - 12 : split[0];
  const meridiem = Number(split[0]) > 12 ? "PM" : "AM";
  const dayTime = `${arr[0]}, ${hour}:${split[1]} ${meridiem}`;
  const date = `${arr[1]}. ${arr[2]}, ${arr[3]}`;

  return [date, dayTime];
}

function capitalizeStr(str) {
  const split = str.split("");
  split[0] = split[0].toUpperCase();
  return split.join("");
}
function updateCurrentWeather([cityName, forecast]) {
  const [date, dayTime] = getDateTime();
  cityNameCon.textContent = `${cityName} Today`;
  actualTempCon.textContent = toCelsius(forecast.current.temp);
  feelsTempCon.textContent = `Feels ${toCelsius(forecast.current.feels_like)}`;
  weatherIcon.src = getIcon(forecast.current.weather[0].icon);
  dateP.textContent = date;
  dayTimeP.textContent = dayTime;
  rainEl.textContent = `${forecast.daily[0].pop * 100}% Chance of Raining`;
  remark.textContent = capitalizeStr(forecast.current.weather[0].description);
  windP.textContent = `Wind: ${(forecast.current.wind_speed * 3.6).toFixed(
    2
  )} km/h`;
}

function updateFfWeather([, forecast]) {
  // console.log(forecast);

  if (ffWeatherCon.firstElementChild) {
    while (ffWeatherCon.firstElementChild)
      ffWeatherCon.removeChild(ffWeatherCon.firstElementChild);
  }

  for (let i = 1; i < forecast.daily.length; i += 1) {
    const dayForecast = forecast.daily[i];

    const con = document.createElement("div");
    con.classList.add("ff-weather-wrapper");

    const todayUnix = new Date().valueOf();
    const dateArr = new Date(todayUnix + i * 86400000)
      .toString()
      .split(" ")
      .slice(0, 3);

    const h2 = document.createElement("h2");
    h2.classList.add("ff-weather-h2");
    h2.textContent = `${dateArr[0]}, ${dateArr[1]}. ${dateArr[2]}`;

    const div = document.createElement("div");
    div.classList.add("ff-weather-desc");

    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("ff-weather-img-desc");
    const image = document.createElement("img");
    image.src = getIcon(dayForecast.weather[0].icon);
    image.classList.add("ff-weather-icon");

    const imgDescWrapper = document.createElement("div");

    const pTemp = document.createElement("p");
    const pFeels = document.createElement("p");
    const pRain = document.createElement("p");
    pTemp.textContent = toCelsius(
      (dayForecast.temp.min + dayForecast.temp.max) / 2
    );
    pFeels.textContent = toCelsius(dayForecast.feels_like.day);
    pRain.textContent = `${Math.floor(dayForecast.pop * 100)}%`;
    imgDescWrapper.appendChild(pTemp);
    imgDescWrapper.appendChild(pFeels);
    imgDescWrapper.appendChild(pRain);

    imgWrapper.appendChild(image);
    imgWrapper.appendChild(imgDescWrapper);

    const pRemarks = document.createElement("p");
    pRemarks.classList.add("no-margin");
    pRemarks.textContent = dayForecast.weather[0].description;

    div.appendChild(imgWrapper);
    div.appendChild(pRemarks);

    con.appendChild(h2);
    // con.appendChild(p);
    con.appendChild(div);
    ffWeatherCon.appendChild(con);
  }
}
// Dasmariñas

function displayCityWeather(cityName) {
  getWeather(cityName)
    .then((forecast) => {
      updateCurrentWeather(forecast);
      updateFfWeather(forecast);
    })
    .catch((e) => console.log(e));
}

displayCityWeather("Dasmariñas");

weatherBtn.addEventListener("click", () =>
  displayCityWeather(weatherInput.value)
);

weatherInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") displayCityWeather(weatherInput.value);
});
