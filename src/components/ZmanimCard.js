import { useState } from 'react';

function ZmanimCard() {
  const [city, setCity] = useState('');
  const [zmanim, setZmanim] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchZmanim = async () => {
    if (!city) return;

    setLoading(true);
    setError(null);
    setZmanim(null);

    try {
      const res = await fetch(`/api/zmanim?city=${encodeURIComponent(city)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load zmanim');
      }

      setZmanim(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // 🔥 CRITICAL FIX: force CITY timezone (not user timezone)
  const formatTime = (iso, timeZone) => {
    if (!iso || !timeZone) return '—';

    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
    });
  };

  return (
    <div style={{ border: '2px solid #673ab7', padding: 20, borderRadius: 8 }}>
      <h2>🕍 Zmanim by City</h2>

      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter any city in the world"
        style={{ padding: 8, marginRight: 8 }}
      />

      <button onClick={fetchZmanim}>Get Zmanim</button>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {zmanim && (
        <>
          <h3>{zmanim.location.title}</h3>
          <p><strong>Timezone:</strong> {zmanim.location.timezone}</p>

          <table>
            <tbody>
              <tr><td>Alot Hashachar</td><td>{formatTime(zmanim.times.alotHaShachar, zmanim.location.timezone)}</td></tr>
              <tr><td>Sunrise</td><td>{formatTime(zmanim.times.sunrise, zmanim.location.timezone)}</td></tr>
              <tr><td>Latest Shema</td><td>{formatTime(zmanim.times.sofZmanShma, zmanim.location.timezone)}</td></tr>
              <tr><td>Latest Tefillah</td><td>{formatTime(zmanim.times.sofZmanTfilla, zmanim.location.timezone)}</td></tr>
              <tr><td>Chatzot</td><td>{formatTime(zmanim.times.chatzot, zmanim.location.timezone)}</td></tr>
              <tr><td>Mincha Gedola</td><td>{formatTime(zmanim.times.minchaGedola, zmanim.location.timezone)}</td></tr>
              <tr><td>Plag HaMincha</td><td>{formatTime(zmanim.times.plagHaMincha, zmanim.location.timezone)}</td></tr>
              <tr><td>Sunset</td><td>{formatTime(zmanim.times.sunset, zmanim.location.timezone)}</td></tr>
              <tr>
                <td><strong>Nightfall (Tzeit)</strong></td>
                <td><strong>{formatTime(zmanim.times.tzeit, zmanim.location.timezone)}</strong></td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ZmanimCard;