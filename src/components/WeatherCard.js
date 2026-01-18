import { useState, useEffect } from 'react';
import './Card.css';

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hebrewDate, setHebrewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHebrewDate();

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => {}
    );
  }, []);

  const fetchHebrewDate = async () => {
    try {
      const res = await fetch('/api/hebrew-date');
      const data = await res.json();
      setHebrewDate(`${data.hd} ${data.hm} ${data.hy}`);
    } catch {
      console.error('Failed to load Hebrew date');
    }
  };

  const fetchWeather = async (cityName = city) => {
    if (!cityName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const API_KEY = 'fa62c6ce2848e696a638e127e739ff92';

      // Current weather
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=imperial`
      );
      if (!res.ok) throw new Error('City not found');
      const data = await res.json();

      setWeather(data);
      setCity(data.name);

      // 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}&units=imperial`
      );
      const forecastData = await forecastRes.json();

      const daily = forecastData.list.filter(item =>
        item.dt_txt.includes('12:00:00')
      );

      setForecast(daily.slice(0, 5));
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setError(err.message || 'Weather error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);

    try {
      const API_KEY = 'fa62c6ce2848e696a638e127e739ff92';

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      setWeather(data);
      setCity(data.name);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );
      const forecastData = await forecastRes.json();

      const daily = forecastData.list.filter(item =>
        item.dt_txt.includes('12:00:00')
      );

      setForecast(daily.slice(0, 5));
    } catch {
      setWeather(null);
      setForecast([]);
      setError('Could not load weather for your location.');
    } finally {
      setLoading(false);
    }
  };

  const formatDay = (dt) => {
    return new Date(dt * 1000).toLocaleDateString('en-US', {
      weekday: 'short'
    });
  };

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
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
            placeholder="Enter city"
          />
          <button onClick={() => fetchWeather()} disabled={loading}>
            {loading ? 'Loading…' : 'Get Weather'}
          </button>
        </div>

        {error && <p className="error">❌ {error}</p>}
      </div>

      <div className="right weather-list" key={weather?.dt || weather?.name || 'weather'}>
        {weather && !error && (
          <>
            <h3>{weather.name}</h3>
            <p className="subtle">{weather.weather[0].description}</p>
            <p>🌡 {Math.round(weather.main.temp)}°F</p>
            <p>🤔 Feels Like {Math.round(weather.main.feels_like)}°F</p>
            <p>💧 Humidity {weather.main.humidity}%</p>
            <p>🌬 Wind {Math.round(weather.wind.speed)} mph</p>

            {/* 🔽 5-Day Forecast */}
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
