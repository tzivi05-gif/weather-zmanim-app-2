import { useState } from 'react';

function ZmanimCard() {
  const [city, setCity] = useState('');
  const [zmanim, setZmanim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchZmanim = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ City → lat/lon (same API as Weather)
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=fa62c6ce2848e696a638e127e739ff92`
      );
      const geoData = await geoRes.json();

      if (!geoData[0]) throw new Error('City not found');

      const { lat, lon } = geoData[0];

      // 2️⃣ Fetch zmanim from Hebcal
      const zmanimRes = await fetch(
        `https://www.hebcal.com/zmanim?cfg=json&latitude=${lat}&longitude=${lon}`
      );
      const zmanimData = await zmanimRes.json();

      setZmanim(zmanimData);
    } catch (err) {
      console.error(err);
      setError('Could not load zmanim for that city.');
      setZmanim(null);
    }

    setLoading(false);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="card">
      <div className="left">
        <h2>🕍 Zmanim</h2>

        <div className="input-row">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchZmanim()}
            placeholder="Enter city"
          />
          <button onClick={fetchZmanim} disabled={loading}>
            {loading ? 'Loading…' : 'Get Zmanim'}
          </button>
        </div>

        {error && <p className="error">❌ {error}</p>}
      </div>

      <div className="right">
        {zmanim && !error && (
          <>
            <p><strong>Alot Hashachar:</strong> {formatTime(zmanim.alotHaShachar)}</p>
            <p><strong>Sunrise (Netz):</strong> {formatTime(zmanim.sunrise)}</p>
            <p><strong>Latest Shema:</strong> {formatTime(zmanim.sofZmanShma)}</p>
            <p><strong>Latest Tefillah:</strong> {formatTime(zmanim.sofZmanTfilla)}</p>
            <p><strong>Chatzot:</strong> {formatTime(zmanim.chatzot)}</p>
            <p><strong>Mincha Gedola:</strong> {formatTime(zmanim.minchaGedola)}</p>
            <p><strong>Plag HaMincha:</strong> {formatTime(zmanim.plagHaMincha)}</p>
            <p><strong>Sunset (Shkiah):</strong> {formatTime(zmanim.sunset)}</p>
            <p><strong>Nightfall (Tzeit):</strong> {formatTime(zmanim.tzeit)}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ZmanimCard;





