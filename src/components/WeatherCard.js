import { useState, useEffect } from 'react';
import './Card.css';

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [hebrewDate, setHebrewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
  fetchHebrewDate();

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      // Do nothing if user blocks location
    }
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
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=imperial`
      );

      if (!response.ok) throw new Error('City not found');

      const data = await response.json();
      setWeather(data);
      setCity(data.name);
    } catch (err) {
      setWeather(null);
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
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setWeather(data);
      setCity(data.name);
    } catch {
      setWeather(null);
      setError('Could not load weather for your location.');
    } finally {
      setLoading(false);
    }
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

      <div className="right">
        {weather && !error && (
          <>
            <h3>{weather.name}</h3>
            <p className="subtle">{weather.weather[0].description}</p>
            <p>🌡 {Math.round(weather.main.temp)}°F</p>
            <p>🤔 Feels Like {Math.round(weather.main.feels_like)}°F</p>
            <p>💧 Humidity {weather.main.humidity}%</p>
            <p>🌬 Wind {Math.round(weather.wind.speed)} mph</p>
            <p>📈 Pressure {weather.main.pressure} hPa</p>
            <p> 👁 Visibility {Math.round(weather.visibility / 1000)} km</p>
          </>
        )}
      </div>
    </div>
  );
}

export default WeatherCard;