import { useState, useEffect } from "react";
import "./Card.css";

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hebrewDate, setHebrewDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);

  const API_KEY = "fa62c6ce2848e696a638e127e739ff92";

  useEffect(() => {
    fetchHebrewDate();

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => {
        setError("Location permission denied");
      }
    );
  }, []);

  const fetchHebrewDate = async () => {
    try {
      const res = await fetch("/api/hebrew-date");
      const data = await res.json();
      setHebrewDate(`${data.hd} ${data.hm} ${data.hy}`);
    } catch {}
  };

  const fetchWeather = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=imperial`
      );
      if (!res.ok) throw new Error("City not found");

      const data = await res.json();
      setWeather(data);
      setCity(data.name);

      await fetchForecast(data.coord.lat, data.coord.lon);
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setError(err.message || "Weather error");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      setWeather(data);
      setCity(data.name);

      await fetchForecast(lat, lon);
    } catch {
      setWeather(null);
      setForecast([]);
      setError("Could not load weather from your location");
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      const data = await res.json();

      if (!data.list) return;

      const daily = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      setForecast(daily.slice(0, 5));
    } catch {}
  };

  const formatDay = (dt) =>
    new Date(dt * 1000).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="card">
      <div className="left">
        <h2>🌤 Weather</h2>
        <p className="subtle">{hebrewDate && `📅 ${hebrewDate}`}</p>

        <div className="input-row">
          <input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
            placeholder="Enter city"
          />
          <button onClick={fetchWeather} disabled={loading}>
            {loading ? "Loading…" : "Get Weather"}
          </button>
        </div>

        {error && <p className="error">❌ {error}</p>}
      </div>

      <div className="right weather-list">
        {weather && !error && (
          <>
            <h3>{weather.name}</h3>
            <div className="weather-main">
  <img
    className="weather-icon"
    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
    alt={weather.weather[0].description}
  />
  <p className="subtle">{weather.weather[0].description}</p>
</div>
            <p>🌡 {Math.round(weather.main.temp)}°F</p>
            <p>🤔 Feels Like {Math.round(weather.main.feels_like)}°F</p>
            <p>💧 Humidity {weather.main.humidity}%</p>
            <p>🌬 Wind {Math.round(weather.wind.speed)} mph</p>

            <div className="forecast-grid">
              {forecast.map((day) => (
                <div key={day.dt} className="forecast-day">
                  <div className="date">{formatDay(day.dt)}</div>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt=""
                  />
                  <div>{Math.round(day.main.temp)}°F</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WeatherCard;