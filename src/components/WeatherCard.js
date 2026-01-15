import { useState, useEffect } from 'react';
import { HDate } from '@hebcal/core';
import './Card.css';

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [iconLoaded, setIconLoaded] = useState(false);
  const [hebrewDate, setHebrewDate] = useState('');

  const API_KEY = '41f002717e85cead697d31f90c3f09f2';

  // ✅ Hebrew date (NO fetch, NO CORS)
  useEffect(() => {
    const hd = new HDate();
    setHebrewDate(hd.toString());
  }, []);

  // 📍 Load saved city + geolocation
  useEffect(() => {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
      setCity(savedCity);
    }

    if (!navigator.geolocation) return;

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=imperial`
          );

          if (!response.ok) {
            throw new Error('Unable to fetch weather.');
          }

          const data = await response.json();
          setWeather(data);
          setCity(data.name);
          localStorage.setItem('lastCity', data.name);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
  }, []);

  // 🔍 Fetch by city
  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name.');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);
    setIconLoaded(false);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`
      );

      if (!response.ok) {
        throw new Error('City not found.');
      }

      const data = await response.json();
      setWeather(data);
      localStorage.setItem('lastCity', city);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🌤️ Weather</h2>

      {hebrewDate && (
        <p className="hebrew-date">📅 Hebrew Date: {hebrewDate}</p>
      )}

      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
      />

      <button onClick={fetchWeather} disabled={loading}>
        {loading ? 'Loading…' : 'Get Weather'}
      </button>

      {loading && !weather && <div className="spinner"></div>}

      {error && <p className="error">❌ {error}</p>}

      {weather && (
        <div className="details">
          <h3>{weather.name}</h3>

          {weather.weather?.[0]?.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="weather-icon"
              style={{ display: iconLoaded ? 'block' : 'none' }}
              onLoad={() => setIconLoaded(true)}
            />
          )}

          <p>Temperature: {Math.round(weather.main.temp)}°F</p>
          <p>Feels like: {Math.round(weather.main.feels_like)}°F</p>
          <p>Conditions: {weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {Math.round(weather.wind.speed)} mph</p>
          <p>Pressure: {weather.main.pressure} hPa</p>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;
