import './App.css';
import WeatherCard from './components/WeatherCard';
import ZmanimCard from './components/ZmanimCard';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>🌤️ Weather & 🕯️ Zmanim App 🕍</h1>
        <p>Get weather and Jewish prayer times for your location</p>
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