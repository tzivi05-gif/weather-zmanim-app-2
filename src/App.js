import './App.css';
import WeatherCard from './components/WeatherCard';
import ZmanimCard from './components/ZmanimCard';
import { useTheme } from './ThemeContext';
import { themes } from './themes';

function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const currentTheme = themes[theme];

  return (
    <div
      className="App"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
        minHeight: '100vh'
      }}
    >
      <header
        className="app-header"
        style={{
          background: currentTheme.headerBackground,
          color: currentTheme.headerText
        }}
      >
        <h1>🌤️ Weather & 🕯️ Zmanim App 🕍</h1>
        <p>Get weather and Jewish prayer times for your location</p>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-pressed={isDark}
          type="button"
          style={{
            border: `2px solid ${currentTheme.headerText}`,
            color: currentTheme.headerText
          }}
        >
          {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </header>
      
      <main className="app-main">
        <WeatherCard theme={currentTheme} />
        <ZmanimCard theme={currentTheme} />
      </main>

      <footer
        className="app-footer"
        style={{ backgroundColor: currentTheme.cardBackground }}
      >
        <p>Built with React ⚛️</p>
      </footer>
    </div>
  );
}

export default App;