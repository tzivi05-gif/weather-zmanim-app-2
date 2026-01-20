import './App.css';
import WeatherCard from './components/WeatherCard';
import ZmanimCard from './components/ZmanimCard';
import { useTheme } from './ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌤️ Weather & 🕯️ Zmanim App 🕍</h1>
        <p>Get weather and Jewish prayer times for your location</p>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
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