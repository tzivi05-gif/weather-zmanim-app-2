import { useEffect, useState } from 'react';
import './App.css';
import WeatherCard from './components/WeatherCard';
import ZmanimCard from './components/ZmanimCard';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDark(saved === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className={`App${isDark ? ' dark' : ''}`}>
      <header className="app-header">
        <h1>🌤️ Weather & 🕯️ Zmanim App 🕍</h1>
        <p>Get weather and Jewish prayer times for your location</p>
        <button
          className="theme-toggle"
          onClick={() => setIsDark((prev) => !prev)}
          aria-pressed={isDark}
          type="button"
        >
          {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </header>
      
      <main className="app-main">
        <WeatherCard />
        <ZmanimCard />
      </main>

      <footer className="app-footer">
        <p>Built with React ⚛️</p>
      </footer>
    </div>
  );
}

export default App;