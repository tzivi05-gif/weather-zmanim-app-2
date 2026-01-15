import { useState, useEffect } from 'react';
import { HDate } from '@hebcal/core';
import './Card.css';

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [hebrewDate, setHebrewDate] = useState('');

  const API_KEY = '41f002717e85cead697d31f90c3f09f2';

  // Hebrew date
  useEffect(() => {
    const hd = new HDate();
    setHebrewDate(hd.toString());
  }, []);

  // Load saved city or geolocation
  useEffect(() => {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) setCity(savedCity);

    if (!navigator.geolocation) return;

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}&units=imperial`
          );

          if (!res.ok) throw new Error('Unable to fetch weather');

          const data = await res.json();
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

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`
      );

      if (!res.ok) throw new Error('City not found');

      const data = await res.json();
      setWeather(data);
      localStorage.setItem('lastCity', data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🌤️ Weather</h2>

      <p className="subtle">📅 {hebrewDate}</p>

      <div className="input-row">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
        />
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>

      {error && <p className="error">❌ {error}</p>}

      {weather && (
        <div className="details">
          <h3>{weather.name}</h3>

          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            className="weather-icon"
          />

          <div className="grid">
            <div><strong>Temp</strong><span>{Math.round(weather.main.temp)}°F</span></div>
            <div><strong>Feels</strong><span>{Math.round(weather.main.feels_like)}°F</span></div>
            <div><strong>Humidity</strong><span>{weather.main.humidity}%</span></div>
            <div><strong>Wind</strong><span>{Math.round(weather.wind.speed)} mph</span></div>
          </div>

          <p className="conditions">{weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;