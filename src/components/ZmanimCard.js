import { useState } from 'react';

function ZmanimCard() {
  const [city, setCity] = useState('Brooklyn');
  const [zmanim, setZmanim] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchZmanim = async () => {
    setLoading(true);
    setError('');
    setZmanim(null);

    try {
      const res = await fetch(`/api/zmanim?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setZmanim(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // 🔒 FORCE city timezone — NEVER browser timezone
  const formatTime = (iso, tz) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(new Date(iso));
  };

  return (
    <div className="card">
      <h2>🕍 Zmanim by City</h2>

      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter any city"
      />

      <button onClick={fetchZmanim} disabled={loading}>
        {loading ? 'Loading…' : 'Get Zmanim'}
      </button>

      {error && <p className="error">{error}</p>}

      {zmanim && (
        <>
          <h3>{zmanim.city}</h3>
          <p className="timezone">Timezone: {zmanim.timezone}</p>

          <table>
            <tbody>
              <tr><td>Alot Hashachar</td><td>{formatTime(zmanim.times.alotHaShachar, zmanim.timezone)}</td></tr>
              <tr><td>Sunrise</td><td>{formatTime(zmanim.times.sunrise, zmanim.timezone)}</td></tr>
              <tr><td>Latest Shema</td><td>{formatTime(zmanim.times.sofZmanShma, zmanim.timezone)}</td></tr>
              <tr><td>Latest Tefillah</td><td>{formatTime(zmanim.times.sofZmanTfilla, zmanim.timezone)}</td></tr>
              <tr><td>Chatzot</td><td>{formatTime(zmanim.times.chatzot, zmanim.timezone)}</td></tr>
              <tr><td>Mincha Gedola</td><td>{formatTime(zmanim.times.minchaGedola, zmanim.timezone)}</td></tr>
              <tr><td>Plag HaMincha</td><td>{formatTime(zmanim.times.plagHaMincha, zmanim.timezone)}</td></tr>
              <tr><td>Sunset</td><td>{formatTime(zmanim.times.sunset, zmanim.timezone)}</td></tr>
              <tr><td>Nightfall (Tzeit)</td><td>{formatTime(zmanim.times.tzeit, zmanim.timezone)}</td></tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ZmanimCard;