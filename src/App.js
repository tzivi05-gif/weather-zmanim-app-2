import './App.css';
import WeatherCard from './components/WeatherCard';
import ZmanimCard from './components/ZmanimCard';

function App() {
  return (
    <div className="App">
      <header style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white'
      }}>
        <h1>🌤️ Weather & Zmanim App 🕍</h1>
        <p>Get weather and Jewish prayer times for your location</p>
      </header>
      
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <WeatherCard />
        <ZmanimCard />
      </main>
      
      <footer style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        textAlign: 'center'
      }}>
        <p>Built with React ⚛️</p>
      </footer>
    </div>
  );
}

export default App;