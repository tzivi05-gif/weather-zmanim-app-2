import { useEffect, useState } from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard";
import ZmanimCard from "./components/ZmanimCard";
import { useTheme } from "./contexts/ThemeContext";
import { themes } from "./themes";
import FavoriteLocations from "./components/FavoriteLocations";
import type { Location } from "./types";
import { api } from "./services/api";

function App() {
  // Theme comes from context so all cards share the same palette.
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const currentTheme = themes[theme];
  // Single source of truth for the location used by both cards.
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Quick backend ping so the UI can fail fast if API is down.
    api.getHealth().catch((error) => {
      console.warn("API health check failed", error);
    });
  }, []);

  return (
    <div
      className="App"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text,
        minHeight: "100vh"
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
          {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </header>

      <main className="app-main">
        {/* Favorites drives selectedLocation for both cards. */}
        <FavoriteLocations
          theme={currentTheme}
          onSelectLocation={(location) => setSelectedLocation(location)}
        />
        <WeatherCard theme={currentTheme} selectedLocation={selectedLocation} />
        <ZmanimCard theme={currentTheme} selectedLocation={selectedLocation} />
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
