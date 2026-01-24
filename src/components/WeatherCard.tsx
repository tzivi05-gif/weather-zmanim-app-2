import { useEffect, useState } from "react";
import "./Card.css";
import type { Theme } from "../themes";
import type { Location } from "../types/location";
import { api, ForecastResponse, WeatherResponse } from "../services/api";

type WeatherCardProps = {
  theme: Theme;
  selectedCity?: string;
  selectedLocation?: Location | null;
};

function WeatherCard({ theme, selectedCity, selectedLocation }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse["list"]>([]);
  const [hebrewDate, setHebrewDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("Brooklyn");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHebrewDate();

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => {
        // Ignore if the user blocks location access.
      }
    );
  }, []);

  useEffect(() => {
    if (selectedCity && selectedCity !== city) {
      setCity(selectedCity);
      setError(null);
      fetchWeather(selectedCity);
    }
  }, [selectedCity, city]);

  useEffect(() => {
    if (!selectedLocation?.city) return;

    const { latitude, longitude } = selectedLocation;

    if (typeof latitude === "number" && typeof longitude === "number") {
      setCity(selectedLocation.city);
      setError(null);
      fetchWeatherByCoords(latitude, longitude);
      return;
    }

    if (selectedLocation.city !== city) {
      setCity(selectedLocation.city);
      setError(null);
      fetchWeather(selectedLocation.city);
    }
  }, [selectedLocation, city]);

  const fetchHebrewDate = async () => {
    try {
      const data = await api.getHebrewDate();
      setHebrewDate(`${data.hd} ${data.hm} ${data.hy}`);
    } catch {
      setHebrewDate("");
    }
  };

  const fetchWeather = async (cityToFetch?: string) => {
    const targetCity = (cityToFetch ?? city).trim();
    if (!targetCity) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getWeather(targetCity);
      setWeather(data);
      setCity(data.name || targetCity);
      setForecast([]);

      if (data.cached) {
        console.log("✅ Weather loaded from cache");
      }

      if (data.coord) {
        await fetchForecast(data.coord.lat, data.coord.lon);
      }
    } catch (err) {
      setWeather(null);
      setForecast([]);
      const message = err instanceof Error ? err.message : "Failed to fetch weather";
      setError(message);
      console.error("Error fetching weather:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getWeatherByCoords(latitude, longitude);
      setWeather(data);
      setCity(data.name || city);

      if (data.cached) {
        console.log("✅ Weather loaded from cache");
      }

      await fetchForecast(latitude, longitude);
    } catch (err) {
      setWeather(null);
      setForecast([]);
      const message = err instanceof Error ? err.message : "Failed to fetch weather";
      setError(message);
      console.error("Error fetching weather:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (latitude: number, longitude: number) => {
    try {
      const data = await api.getForecast(latitude, longitude);
      if (!data.list) return;

      const daily = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
      setForecast(daily.slice(0, 5));
    } catch {
      setForecast([]);
    }
  };

  const formatDay = (dt: number) =>
    new Date(dt * 1000).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div
      className="card"
      style={{
        backgroundColor: theme.weatherCardBackground,
        border: `2px solid ${theme.weatherCardBorder}`,
        color: theme.text,
        position: "relative"
      }}
    >
      {weather?.cached && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px"
          }}
        >
          📦 Cached
        </div>
      )}
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
            style={{
              backgroundColor: theme.cardBackground,
              color: theme.text,
              border: `1px solid ${theme.cardBorder}`
            }}
          />
          <button
            onClick={() => fetchWeather()}
            disabled={loading}
            style={{
              backgroundColor: theme.weatherCardBorder,
              color: "#fff"
            }}
          >
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
              {weather.weather?.[0]?.icon && (
                <img
                  className="weather-icon"
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                />
              )}
              <p className="subtle">{weather.weather?.[0]?.description}</p>
            </div>
            <p>Temperature: {Math.round(weather.main.temp)}°F</p>
            <p>Feels like: {Math.round(weather.main.feels_like)}°F</p>
            <p>Conditions: {weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
            {forecast && forecast.length > 0 && (
              <div className="forecast-grid">
                {forecast.map((day) => (
                  <div
                    key={day.dt}
                    className="forecast-day"
                    style={{
                      backgroundColor: theme.cardBackground,
                      color: theme.text,
                      border: `1px solid ${theme.cardBorder}`
                    }}
                  >
                    <div className="date">{formatDay(day.dt)}</div>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt=""
                    />
                    <div>{Math.round(day.main.temp)}°F</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WeatherCard;
