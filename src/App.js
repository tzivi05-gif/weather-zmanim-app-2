import { useEffect, useState } from 'react';
import './App.css';
import WeatherCard from './components/WeatherCard';
import ZmanimCard from './components/ZmanimCard';

function App() {
  const [hebrewDate, setHebrewDate] = useState('');

  useEffect(() => {
    const fetchHebrewDate = async () => {
      try {
        const res = await fetch('https://www.hebcal.com/converter?cfg=json&g2h=1');
        const data = await res.json();
        setHebrewDate(`${data.hd} ${data.hm} ${data.hy}`);
      } catch (err) {
        console.error('Failed to load Hebrew date', err);
      }
    };

    fetchHebrewDate();
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌤️ Weather & 🕯️ Zmanim App 🕍</h1>
        <p>Get weather and Jewish prayer times for your location</p>
        {hebrewDate && <p className="hebrew-date">📅 {hebrewDate}</p>}
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